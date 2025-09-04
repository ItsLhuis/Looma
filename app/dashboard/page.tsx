import { requireAuth } from "@/lib/auth.utils"

import { LogoutButton } from "@/components/LogoutButton"

export default async function DashboardPage() {
  await requireAuth()

  return (
    <div className="min-h-screen pt-8 bg-background">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-3">Dashboard</h1>
        <LogoutButton />
      </div>
    </div>
  )
}
