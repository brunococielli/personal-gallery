import express from "express"
import bcrypt from "bcrypt"
import crypto from "crypto"
import { Resend } from "resend"

import prisma from "../db.js"
import { sessions } from "../sessions.js"

const router = express.Router()
const resend = new Resend(process.env.RESEND_API_KEY)

const createToken = () =>
  Math.random().toString(36).slice(2) + Date.now()

const generateResetToken = () =>
  crypto.randomBytes(32).toString("hex")

router.post("/register", async (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).send("missing email or password")

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return res.status(409).send("email already exists")

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: { email, password: hashedPassword }
  })

  res.send("User created successfully")
})

router.post("/login", async (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).send("missing email or password")

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(400).send("Invalid credentials")

  const match = await bcrypt.compare(password, user.password)
  if (!match) return res.status(400).send("Invalid credentials")

  const token = createToken()
  sessions[token] = user.email

  res.json({ token })
})

router.post("/logout", (req, res) => {
  const token = req.headers.authorization
  if (!token) return res.status(401).send("No token")

  delete sessions[token]
  res.send("Logged out")
})

router.get("/check", (req, res) => {
  const token = req.headers.authorization
  if (!token || !sessions[token])
    return res.status(401).send("Invalid token")

  res.send("OK")
})

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(404).send("User doesn't exist")

  const resetToken = generateResetToken()
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex")

  await prisma.user.update({
    where: { email },
    data: {
      resetToken: hashedToken,
      resetTokenExpires: new Date(Date.now() + 15 * 60 * 1000)
    }
  })

  const resetLink =
    `http://localhost:3000/reset-password.html?token=${resetToken}`

  await resend.emails.send({
    from: "Ted <onboarding@resend.dev>",
    to: email,
    subject: "Reset your password",
    html: `<a href="${resetLink}">Reset password</a>`
  })

  res.send("Reset link sent")
})

router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex")

  const user = await prisma.user.findFirst({
    where: {
      resetToken: hashedToken,
      resetTokenExpires: { gt: new Date() }
    }
  })

  if (!user) return res.status(400).send("Invalid or expired token")

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await bcrypt.hash(newPassword, 10),
      resetToken: null,
      resetTokenExpires: null
    }
  })

  res.send("Password updated")
})

export default router