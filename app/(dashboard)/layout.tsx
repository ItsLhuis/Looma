import { type ReactNode } from "react"

import { redirect } from "next/navigation"

import { verifySession } from "@/lib/dal"

import { FadeLayout } from "@/components/ui"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await verifySession()

  if (!session) {
    redirect("/sign-in")
  }

  return (
    <div>
      <FadeLayout as="main">{children}</FadeLayout>
    </div>
  )
}
