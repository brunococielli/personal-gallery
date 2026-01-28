import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import "dotenv/config"

import authRoutes from "./routes/auth.routes.js"
import uploadRoutes from "./routes/upload.routes.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(express.json())

app.use("/", express.static(path.join(__dirname, "personal-gallery", "public")))
app.use(
  "/personal-gallery/uploads",
  express.static(path.join(__dirname, "personal-gallery", "uploads"))
)

app.use("/", authRoutes)
app.use("/", uploadRoutes)

app.listen(3000, () => {
  console.log("server is listening on port 3000!")
})