import { Router } from "express"
import { body } from "express-validator";
import db from "../helpers/database/db";
import { verifyAccessToken } from "../helpers/tokenHandler";

const router = Router()
/* TODO: ROUTES:
 * POST /api/v1/timetable (create a timetable)
 * GET /api/v1/timetables (list all timetables of a specific user)
 * GET /api/v1/timetables/:id (get a specific timetable)
 * DELETE /api/v1/tiemtables/:id (Delete a timetable)
 * PUT /api/v1/timetables/:id (change/ update a timetable)
 *
 * ==== REMEMBER CRUD ====
 * 1. Create
 * 2. Read
 * 3. Update
 * 4. Delete
 */

router.post("/api/v1/timetable", verifyAccessToken, body("name").notEmpty().isString(), body("description").optional().isString(), (req, res) => {
  try {
    const { name, description } = req.body

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized, user not found" })
    }

    db.prepare("INSERT INTO timetables (name, description, user_id) VALUES (?, ?, ?)").run(name, description, req.user?.id || -1)

    return res.status(201).json({ message: "Timetable created" })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
})

router.delete("/api/v1/timetable/:id", verifyAccessToken, body("id").isNumeric(), (req, res) => {
  try {} catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
})

router.get("/api/v1/timetable/:id", body("id").isString().notEmpty(), verifyAccessToken, (req, res) => {
  try {
    const timetableID = req.body.id

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized, user not found" })
    }

    const timetable = db.prepare("SELECT * FROM timetables WHERE id = ? AND user_id = ?").get(timetableID, req.user?.id)
    if (!timetable) {
      return res.status(404).json({ error: "Timetable not found" })
    }
    return res.status(200).json({ timetable })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
})

router.get("/api/v1/timetables", verifyAccessToken, body("filter").optional().isObject(), (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized, user not found" })
  }

  const filter = req.body.filter || {}

  const timetables = db.prepare("SELECT * FROM timetables WHERE user_id = ?").all(req.user.id)

  if (filter) {
    timetables.filter((timetable: any) => {
      for (const key in filter) {
        if (timetable[key] !== filter[key]) {
          return false
        }
      }
      return true
    })
  }

  return res.status(200).json({ timetables })
})

export default router;