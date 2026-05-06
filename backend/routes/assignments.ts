import { Router } from "express"
import { body } from "express-validator"
import db from "../helpers/database/db"
import { verifyAccessToken } from "../helpers/tokenHandler"

const router = Router()

router.get(
  "/api/v1/assignments",
  body("authorization").isString().notEmpty(),
  verifyAccessToken,
  (req, res) => {
    console.log("hi")
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" })
      }

      const assignments = db
        .prepare("SELECT * FROM assignments WHERE user_id = ?")
        .all(req.user?.id)

      return res.status(201).send(assignments)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: "Internal server error" })
    }
  },
)

// router.post(
//   "/api/v1/assignment",
//   body("name").isString(),
//   body("description").isString().optional(),
//   body("dueDate").isISO8601().isString().notEmpty(),
//   body("color").isHexColor().notEmpty(),
// )

router.patch(
  "/api/v1/assignment",
  verifyAccessToken,
  body("id").isInt(),
  body("newValues").isObject(),
  (req, res) => {
    const { id, newValues } = req.body

    if (!id || !newValues || Object.keys(newValues).length === 0) {
      return res.status(400).json({ error: "400 Bad Request" })
    }

    const allowedFields = ["name", "description", "dueDate"]

    const fields = Object.keys(newValues).filter((field) => allowedFields.includes(field))

    if (fields.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" })
    }

    const values = fields.map((field) => newValues[field])
    const setClause = fields.map((field) => `${field} = ?`).join(", ")

    try {
      const result = db
        .prepare(`UPDATE assignments SET ${setClause} WHERE id = ? AND user_id = ?`)
        .run(...values, id, req.user?.id)

      if (result.changes === 0) {
        return res.status(404).json({ error: "Assignment not found" })
      }

      return res.status(200).json({ message: "Updated successfully" })
    } catch (err) {
      return res.status(500).json({ error: "Internal Server Error" })
    }
  },
)

export default router
