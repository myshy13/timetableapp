import { Router } from "express"
import { body } from "express-validator"
import { verifyAccessToken } from "../helpers/tokenHandler"
import db from "../helpers/database/db"
import { verifyJWT } from "../helpers/jwt"

const router = Router()
const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

router.get("/api/v1/me", async (req, res) => {
  try {
    const auth = req.headers.authorization

    if (!auth) {
      return res.status(401).json({ error: "Missing token" })
    }

    const token = auth.split(" ")[1]

    let payload
    try {
      payload = await verifyJWT(token)
    } catch {
      return res.status(401).json({ error: "Invalid token" })
    }

    const userId = payload.user_id as string

    const user = db.prepare("SELECT id, uname, name FROM users WHERE id = ?").get(userId)

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    return res.json(user)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
})

export default router
