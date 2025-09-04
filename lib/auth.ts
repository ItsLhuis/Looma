import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"

import { database } from "@/database/client"

export const auth = betterAuth({
  secret: process.env.AUTH_SECRET,
  database: drizzleAdapter(database, {
    provider: "sqlite",
    usePlural: true
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectURI: process.env.GOOGLE_REDIRECT_URI,
      prompt: "select_account",
      accessType: "offline"
    }
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24
  }
})
