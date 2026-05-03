import * as jose from "jose"
import { config } from "dotenv"
import { jwtVerify } from "jose"
import { getPublicKey } from "./keys"
import db, { User } from "./database/db"
config()

const jwtPrivateKeyEnv = process.env.JWT_PRIVATE_KEY
const jwtPublicKeyEnv = process.env.JWT_PUBLIC_KEY

if (!jwtPrivateKeyEnv) {
  throw new Error(
    "JWT_PRIVATE_KEY environment variable is not set. Please add it to your .env file.",
  )
}

if (!jwtPublicKeyEnv) {
  throw new Error(
    "JWT_PUBLIC_KEY environment variable is not set. Please add it to your .env file.",
  )
}

const privateKeyPem = jwtPrivateKeyEnv.replace(/\\n/g, "\n")
const publicKeyPem = jwtPublicKeyEnv.replace(/\\n/g, "\n")

let privateKey: any
let publicKey: any

async function initializeKeys() {
  if (!privateKey) {
    privateKey = await jose.importPKCS8(privateKeyPem, "RS256")
  }
  if (!publicKey) {
    publicKey = await jose.importSPKI(publicKeyPem, "RS256")
  }
}

export interface jwtPayload {
  uname: string
  name: string
}

export interface verification {
  payload: jwtPayload
}

export async function verifyJWT(token: string) {
  const publicKey = await getPublicKey()

  const { payload } = await jwtVerify(token, publicKey, {
    algorithms: ["RS256"],
  })

  return payload
}

export async function signJWT(userID: number, exp: string) {
  await initializeKeys()
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userID) as User
  const jwt = await new jose.SignJWT({
    uname: user.uname,
    name: user.name,
  })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt()
    .setIssuer("urn:hamactimetable:issuer")
    .setExpirationTime(`${exp}`)
    .sign(privateKey)

  return jwt
}

export async function parseJWT(jwt: string): Promise<verification | boolean> {
  try {
    await initializeKeys()
    const { payload, protectedHeader }: { payload: jwtPayload; protectedHeader: any } =
      await jose.jwtVerify(jwt, publicKey, {
        issuer: "urn:hamactimetable:issuer",
      })
    return {
      payload: payload,
    }
  } catch (err) {
    console.error("jwt.ts: Error parsing JWT with jose. Verification failed")
    console.error(err)
    return false
  }
}
