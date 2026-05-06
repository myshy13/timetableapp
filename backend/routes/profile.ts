import { Router } from "express"
import { body } from "express-validator"
import { verifyAccessToken } from "../helpers/tokenHandler"
import db from "../helpers/database/db"
import { verifyJWT } from "../helpers/jwt"

const router = Router()

router.get(
  "/api/v1/me",
  body("Authorization").isString().notEmpty(),
  verifyAccessToken,
  async (req, res) => {
    try {
      const auth = req.headers.authorization

      if (!auth) {
        return res.status(401).json({ error: "Missing token" })
      }

      const token = auth.split(" ")[1]

      let payload
      payload = await verifyJWT(token)

      if (!payload) {
        return res.status(404).json({ error: "User not found" })
      }

      const userID = db.prepare("SELECT id FROM users WHERE uname = ?").get(payload.uname) as {
        id: number
      }

      return res.json({
        uname: payload.uname,
        name: payload.name,
        id: userID.id,
      })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: "Internal server error" })
    }
  },
)

export default router
