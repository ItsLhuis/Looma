import { cache } from "react"

import { headers } from "next/headers"

import { auth } from "./auth"

export const verifySession = cache(async () => {
  try {
    const headersList = await headers()
    const session = await auth.api.getSession({
      headers: headersList
    })

    if (!session) {
      return null
    }

    return session
  } catch (error) {
    return null
  }
})

export const getUser = cache(async () => {
  const session = await verifySession()
  if (!session) return null

  return session.user
})
