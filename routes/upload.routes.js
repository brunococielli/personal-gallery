import express from "express"
import fs from "fs"
import path from "path"

import prisma from "../db.js"
import { upload } from "../upload.js"
import { authMiddleware } from "../middleware/authMiddleware.js"

const router = express.Router()

router.post(
  "/upload",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    if (!req.file)
      return res.status(400).json({ error: "No file uploaded" })

		const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { images: true }
    })

		if (user.images.length >= 3) {
			fs.unlinkSync(req.file.path)
			return res.status(400).json({ error: "Image limit reached" })
		}	
		
    const imagePath = `/uploads/${req.file.filename}`

    await prisma.user.update({
      where: { id: req.user.id },
      data: { images: { push: imagePath } }
    })

    res.json({ message: "Image uploaded", image: imagePath })
  }
)

router.delete("/deleteImage", authMiddleware, async (req, res) => {
  const { src } = req.body
  if (!src) return res.status(400).json({ error: "Missing image src" })

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { images: true }
  })

  if (!user || !user.images.includes(src))
    return res.status(403).json({ error: "Not allowed" })

  const filename = path.basename(src)
  const filePath = path.join(
    process.cwd(),
    "uploads",
    filename
  )

  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)

  await prisma.user.update({
    where: { id: req.user.id },
    data: {
      images: {
        set: user.images.filter(img => img !== src)
      }
    }
  })

  res.json({ message: "Image deleted" })
})

router.get("/sendImages", authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { images: true }
  })

  res.json(user.images)
})

export default router