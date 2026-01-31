import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import "dotenv/config"

import authRoutes from "./routes/auth.routes.js"
import uploadRoutes from "./routes/upload.routes.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PORT = process.env.PORT || 3000

const app = express()

app.use(express.json())

app.use("/", express.static(path.join(__dirname, "public")))
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
)

app.use("/", authRoutes)
app.use("/", uploadRoutes)

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`)
})