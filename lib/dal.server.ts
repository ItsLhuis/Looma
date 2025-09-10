import { cache } from "react"

import { headers } from "next/headers"

import { auth } from "./auth"

export const verifySession = cache(async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return null
    }

    return session
  } catch (error) {
    console.error("Session verification error:", error)
    return null
  }
})

export const getUser = cache(async () => {
  const session = await verifySession()
  return session?.user ?? null
})

export const isAuthenticated = cache(async () => {
  const session = await verifySession()
  return !!session
})
