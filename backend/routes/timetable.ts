import { Router } from "express"
import { body } from "express-validator"
import db from "../helpers/database/db"
import { verifyAccessToken } from "../helpers/tokenHandler"

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

router.post(
  "/api/v1/timetable",
  verifyAccessToken,
  body("name").notEmpty().isString(),
  body("description").optional().isString(),
  (req, res) => {
    try {
      const { name, description } = req.body

      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized, user not found" })
      }

      db.prepare("INSERT INTO timetables (name, description, user_id) VALUES (?, ?, ?)").run(
        name,
        description,
        req.user?.id || -1,
      )

      return res.status(201).json({ message: "Timetable created" })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: "Internal server error" })
    }
  },
)

router.delete("/api/v1/timetable/:id", verifyAccessToken, body("id").isNumeric(), (req, res) => {
  try {
    const timetableID = req.body.id

    if (!req.user) {
      return res.status(500).json({ error: "Unauthorized" })
    }

    const timetable = db
      .prepare("DELETE FROM timetables WHERE id = ? AND user_id = ?")
      .run(timetableID, req.user?.id)
    if (!timetable) {
      return res.status(404).json({ error: "Timetable not found" })
    }
    return res.status(200).json({ message: "Timetable deleted" })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: "Internal server error" })
  }
})

router.patch(
  "/api/v1/timetable/:id",
  verifyAccessToken,
  body("id").isNumeric().notEmpty(),
  body("newValues").isObject().notEmpty(),
  (req, res) => {
    const { timetableID, newValues } = req.body

    if (!req.user || !timetableID || !newValues) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    var timetable = db
      .prepare("SELECT * FROM timetables WHERE id = ? AND user_id = ?")
      .get(timetableID, req.user?.id)
    if (!timetable) {
      return res.status(404).json({ error: "Timetable not found" })
    }
    newValues.updated_at = new Date().toISOString()

    const updateFields = Object.keys(newValues)
      .map((key) => `${key} = ?`)
      .join(", ")
    const updateValues = Object.values(newValues)

    db.prepare(`UPDATE timetables SET ${updateFields} WHERE id = ? AND user_id = ?`).run(
      ...updateValues,
      timetableID,
      req.user?.id,
    )

    return res.status(200).json({ message: "Timetable updated" })
  },
)

router.get(
  "/api/v1/timetable/:id",
  body("id").isString().notEmpty(),
  verifyAccessToken,
  (req, res) => {
    try {
      const timetableID = req.body.id

      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized, user not found" })
      }

      const timetable = db
        .prepare("SELECT * FROM timetables WHERE id = ? AND user_id = ?")
        .get(timetableID, req.user?.id) as {
        name: string
        description?: string
        created_at: string
        updated_at: string
      }
      if (!timetable) {
        return res.status(404).json({ error: "Timetable not found" })
      }
      return res.status(200).json({
        name: timetable.name,
        description: timetable.description,
        createdAt: timetable.created_at,
        updatedAt: timetable.updated_at,
      })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: "Internal server error" })
    }
  },
)

router.get(
  "/api/v1/timetables",
  verifyAccessToken,
  body("filter").optional().isObject(),
  (req, res) => {
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
  },
)

// ============= EVENT ROUTES ============
/* TODO ROUTES:
 * POST /api/v1/event (create an event)
 * GET /api/v1/events (list all events of a specific timetable)
 * GET /api/v1/events/:id
 * DELETE /api/v1/events/:id
 * PUT /api/v1/events/:id
 *
 * CRUD
 */

router.post(
  "/api/v1/event",
  verifyAccessToken,
  body("timetableId").isNumeric().notEmpty(),
  body("title").notEmpty().isString(),
  body("location").isString().optional(),
  body("start").isISO8601().notEmpty(),
  body("end").isISO8601().optional(),
  body("description").isString().optional(),
  body("color").isHexColor().notEmpty(),
  body("teacher").isString().optional(),
  (req, res) => {
    const { timetableId, title, location, start, end, description, color, teacher } = req.body
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    db.prepare(
      "INSERT INTO events (timetable_id, title, location, start, end, description, color, teacher) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    ).run(timetableId, title, location, start, end, description, color, teacher)
  },
)

export default router
