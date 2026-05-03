import { Router } from "express"
import { createRefreshToken, verifyRefreshToken } from "../helpers/tokenHandler"
import { signJWT } from "../helpers/jwt"
import db, { User } from "../helpers/database/db"
import { hash, verify } from "argon2"
import { body, validationResult } from "express-validator"
import rateLimit from "express-rate-limit"

const router = Router()

router.post("/api/v1/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken

    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token" })
    }

    const tokenData = await verifyRefreshToken(refreshToken)

    if (!tokenData) {
      return res.status(401).json({ error: "Invalid refresh token" })
    }

    const userID = tokenData.user_id

    return res.status(200).json({
      accessToken: await signJWT(userID, "2h"),
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
})

router.post(
  "/api/v1/login",
  body("uname").isLength({ min: 3, max: 30 }).trim().toLowerCase(),
  body("pword").isString().isLength({ min: 8 }),
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { uname, pword }: { uname: string; pword: string } = req.body

      const dbItem = db.prepare("SELECT * FROM users WHERE uname = ?").get(uname) as
        | User
        | undefined
      if (!dbItem) {
        return res.status(401).json({ error: "Unauthorized" })
      }

      if (await verify(dbItem.pwordhash, pword)) {
        const accessToken = await signJWT(dbItem.id, "5m")
        const refreshToken = await createRefreshToken(dbItem.id)
        const isProd = process.env.NODE_ENV === "PRODUCTION"
        // 1. Set the Refresh Token in a Secure Cookie
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: isProd,
          sameSite: "strict",
          path: "/api/v1/refresh",
          maxAge: 7 * 24 * 60 * 60 * 1000, // a week
        })

        // 2. Only send the Access Token back in the JSON body
        return res.status(200).json({
          accessToken: accessToken,
        })
      } else {
        return res.status(401).json({ error: "Unauthorized" })
      }
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: "Internal server error" })
    }
  },
)

var limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: "draft-8", // Return `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

if (process.env.NODE_ENV != "PRODUCTION") {
  limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  })
}

router.post(
  "/api/v1/createUser",
  body("uname").isLength({ min: 3, max: 30 }).trim().toLowerCase(),
  body("pword").isString().isLength({ min: 8 }),
  body("name").isLength({ min: 1, max: 100 }).trim(),
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { uname, pword, name } = req.body

      // check if it isn't there already
      if (db.prepare("SELECT * FROM users WHERE uname = ?").get(uname) != null) {
        return res.status(409).json({ error: "User already exists/ Duplicate username" })
      }

      db.prepare("INSERT INTO users (uname, name, pwordhash) VALUES (?, ?, ?)").run(
        uname,
        name,
        await hash(pword),
      )

      return res.status(201).json({ message: "Account created" })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: "Internal server error" })
    }
  },
)

export default router
