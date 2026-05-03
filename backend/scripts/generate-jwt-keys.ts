#!/usr/bin/env node
/**
 * Generate RSA key pair for JWT signing (RS256)
 * Run once: npx tsx scripts/generate-jwt-keys.ts
 * Add the output to your .env file
 */

import { generateKeyPairSync } from "crypto"
import { writeFileSync } from "fs"
import path from "path"

const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
})

console.log("\n=== RSA Key Pair Generated ===\n")
console.log("Add the following to your .env file:\n")
console.log("# Private Key (KEEP SECRET)")
console.log("JWT_PRIVATE_KEY='" + privateKey.replace(/\n/g, "\\n") + "'")
console.log("\n# Public Key (can be shared)")
console.log("JWT_PUBLIC_KEY='" + publicKey.replace(/\n/g, "\\n") + "'")
console.log("\n=============================\n")

// Optionally save to .env.local for development
const envPath = path.join(process.cwd(), ".env.local")
const envContent = `# Generated RSA Keys for JWT (RS256)
JWT_PRIVATE_KEY='${privateKey.replace(/\n/g, "\\n")}'
JWT_PUBLIC_KEY='${publicKey.replace(/\n/g, "\\n")}'
`

try {
  writeFileSync(envPath, envContent)
  console.log(`✓ Keys also saved to ${envPath}`)
} catch (err) {
  console.log(`Note: Could not write to ${envPath}, but keys are displayed above`)
}
