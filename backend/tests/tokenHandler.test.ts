import { describe, it, expect, afterEach } from "vitest"
import { createRefreshToken, verifyRefreshToken } from "../helpers/tokenHandler"
import db from "../helpers/database/db"

describe("Token Handler", () => {
  afterEach(() => {
    db.prepare("DELETE FROM refresh_tokens").run()
  })

  it("should create a refresh token", async () => {
    const token = await createRefreshToken(1)
    expect(token).toBeTruthy()
    expect(typeof token).toBe("string")
  })

  it("should verify a valid refresh token", async () => {
    const token = await createRefreshToken(1)
    const verified = await verifyRefreshToken(token as string)
    expect(verified).toBeTruthy()
  })
})
