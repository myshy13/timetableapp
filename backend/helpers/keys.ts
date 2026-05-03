import { importPKCS8, importSPKI } from "jose"
import { config } from "dotenv"
config()

export async function getPrivateKey() {
  return importPKCS8(process.env.JWT_PRIVATE_KEY!.replace(/\\n/g, "\n"), "RS256")
}

export async function getPublicKey() {
  return importSPKI(process.env.JWT_PUBLIC_KEY!.replace(/\\n/g, "\n"), "RS256")
}
