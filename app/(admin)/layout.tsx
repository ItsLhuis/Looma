import { ReactNode } from "react"

import { redirect } from "next/navigation"

import { verifySession } from "@/lib/dal"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await verifySession()

  if (!session) {
    redirect("/sign-in")
  }

  return (
    <div>
      <main>{children}</main>
    </div>
  )
}
