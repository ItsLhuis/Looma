import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./database/schema.ts",
  out: "./migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL
  },
  verbose: true,
  strict: true
})
