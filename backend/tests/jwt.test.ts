import { describe, it, expect, beforeAll, afterAll, vi } from "vitest"
import { signJWT, parseJWT } from "../helpers/jwt"
import db from "../helpers/database/db"

describe("JWT Functions", () => {
  beforeAll(() => {
    db.prepare("DELETE FROM users WHERE id = 1").run()
    db.prepare("INSERT INTO users (id, uname, name, pwordhash) VALUES (?, ?, ?, ?)").run(
      1,
      "testuser",
      "Test User",
      "hashedpassword",
    )
  })

  afterAll(() => {
    db.prepare("DELETE FROM users WHERE id = 1").run()
  })

  it("should create a valid JWT token", async () => {
    const token = await signJWT(1, "2h")
    expect(token).toBeTruthy()
    expect(typeof token).toBe("string")
  })

  it("should parse a valid JWT token", async () => {
    const token = await signJWT(1, "2h")
    const result = await parseJWT(token)
    expect(result).not.toBe(false)
    if (result !== false && typeof result != "boolean") {
      expect(result.payload.uname).toBeDefined()
      expect(result.payload.uname).toBe("testuser")
    }
  })

  it("should return false for invalid JWT", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    const result = await parseJWT("invalid-token")
    expect(result).toBe(false)
    spy.mockRestore()
  })
})
