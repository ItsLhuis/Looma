import { redirect } from "next/navigation"

import { verifySession } from "./dal"

export async function requireAuth() {
  const session = await verifySession()

  if (!session) {
    redirect("/login")
  }

  return session
}
