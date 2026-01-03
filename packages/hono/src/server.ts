/**
 * Node.js server entry point
 *
 * Loads environment variables from .env file and starts the server
 */

import { config } from "dotenv"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"
import { serve } from "@hono/node-server"
import app from "./app"

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env file from package root
config({ path: resolve(__dirname, "../.env") })

const port = parseInt(process.env.PORT || "3000", 10)

// Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is required")
  console.error("Create a .env file with DATABASE_URL=postgres://...")
  process.exit(1)
}

console.log(`🚀 Starting server on port ${port}`)
console.log(
  `📊 Database: ${process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@")}`
)

serve({
  fetch: app.fetch,
  port,
})
