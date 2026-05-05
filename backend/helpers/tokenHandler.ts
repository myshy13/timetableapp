import { NextFunction, Request, Response } from "express"
import { parseJWT, verification } from "./jwt"
import db, { RefreshToken } from "./database/db"
import { hash, verify } from "argon2"
import crypto from "crypto"

declare global {
  namespace Express {
    interface Request {
      user?: verification["payload"]
    }
  }
}

export async function verifyAccessToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader?.split(" ")[1]

    if (!token) {
      return res.status(401).json({ error: "No token provided" })
    }

    const parsedJwt = await parseJWT(token)

    if (parsedJwt && typeof parsedJwt !== "boolean") {
      req.user = parsedJwt.payload
      return next()
    }

    return res.status(401).json({ error: "Invalid JWT" })
  } catch {
    return res.status(401).json({ error: "Token verification failed" })
  }
}

export async function createRefreshToken(userID: number) {
  try {
    const refreshToken = crypto.randomBytes(64).toString("hex")
    const tokenHash = await hash(refreshToken)
    db.prepare(
      `
        INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)
      `,
    ).run(userID, tokenHash, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
    return refreshToken
  } catch (err) {
    console.error(err)
    return null
  }
}

export async function verifyRefreshToken(refreshToken: string) {
  try {
    const tokens = db
      .prepare(
        `
        SELECT * FROM refresh_tokens WHERE expires_at > datetime('now')
      `,
      )
      .all() as RefreshToken[]

    for (const tokenRecord of tokens) {
      const isValid = await verify(tokenRecord.token_hash, refreshToken)
      if (isValid) {
        return tokenRecord
      }
    }

    throw new Error("Invalid refresh token")
  } catch (err) {
    console.error(err)
    return null
  }
}
