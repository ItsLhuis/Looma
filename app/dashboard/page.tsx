import { requireAuth } from "@/lib/auth.utils"

import { LogoutButton } from "@/components/ui"

export default async function DashboardPage() {
  await requireAuth()

  return (
    <div className="bg-background min-h-screen pt-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-foreground mb-3 text-3xl font-bold">Dashboard</h1>
        <LogoutButton />
      </div>
    </div>
  )
}
