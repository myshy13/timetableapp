import e, { Request, Response } from "express"
import helmet from "helmet"
import { signJWT } from "./helpers/jwt"
import { config } from "dotenv"
import db from "./helpers/database/db"
import createRouter from "./routes/create.ts"
import authRouter from "./routes/auth.ts"
import cookieParser from "cookie-parser"
import cors from "cors"
config()

const app = e()
const port: number = parseInt(process.env.port as string) | 3001

db.exec("") // to spin up the database

app.use(e.json())
app.use(helmet())
app.use(cookieParser())
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        "http://localhost:3000", // dev server (next)
        "https://orange-orbit-5gq55pg5qrgrfvrpr-3001.app.github.dev", // github dev // temporary
      ]
      callback(null, allowed.includes(origin as string))
    },
    credentials: true,
  }),
)

// link routers
app.use(createRouter)
app.use(authRouter)

app.listen(port, async () => {
  console.log(`http://localhost:${port}`)
})
