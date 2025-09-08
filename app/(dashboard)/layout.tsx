import { type ReactNode } from "react"

import { getUser } from "@/lib/dal"

import { redirect } from "next/navigation"

import { Fade, FadeLayout, Sidebar, SidebarInset, SidebarProvider } from "@/components/ui"

import { Sidebar as AppSidebar } from "@/components/layout"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getUser()

  if (!user) {
    redirect("/sign-in")
  }

  return (
    <SidebarProvider>
      <Fade className="flex h-full flex-1">
        <Sidebar collapsible="icon">
          <AppSidebar
            user={{
              name: user?.name ?? null,
              email: user?.email ?? null,
              image: user?.image ?? null
            }}
          />
        </Sidebar>
        <SidebarInset className="min-h-0 flex-1">
          <FadeLayout as="main" className="flex min-h-0 flex-1 flex-col">
            {children}
          </FadeLayout>
        </SidebarInset>
      </Fade>
    </SidebarProvider>
  )
}
