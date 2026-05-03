import { Router } from "express"
import { body } from "express-validator"
import { verifyAccessToken } from "../helpers/tokenHandler"
import db from "../helpers/database/db"

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
  body("accessToken").isString().notEmpty(),
  body("name").isString().notEmpty().isLength({ min: 2 }),
  body("description").isString().optional(),
  verifyAccessToken,
  async (req, res) => {
    const { name, description } = req.body

    const id = db.prepare("SELECT id FROM users WHERE uname = ?").get(req.user!.uname) // req.user can't be undefined (verifyAccessToken)

    db.prepare("INSERT INTO timetables (user_id, name, description)").run(id, name, description)

    return res.status(201).json({ message: "Created Successfully" })
  },
)

export default router
