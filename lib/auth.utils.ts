import { redirect } from "next/navigation"

import { isAuthenticated } from "./dal"

export async function ensureAuth() {
  const authenticated = await isAuthenticated()

  if (!authenticated) {
    redirect("/sign-in")
  }
}
