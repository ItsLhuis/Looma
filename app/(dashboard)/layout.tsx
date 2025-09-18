import { type ReactNode } from "react"

import { cookies } from "next/headers"

import { getUser } from "@/lib/dal.server"

import { redirect } from "next/navigation"

import { Fade, FadeLayout, Sidebar, SidebarInset, SidebarProvider } from "@/components/ui"

import { Sidebar as AppSidebar } from "@/components/layout"

import { UserProvider } from "@/contexts/UserProvider"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getUser()

  if (!user) {
    redirect("/sign-in")
  }

  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar.state")?.value === "true"

  const userData = {
    id: user.id,
    name: user?.name ?? null,
    email: user?.email ?? null,
    image: user?.image ?? null
  }

  return (
    <UserProvider user={userData}>
      <SidebarProvider defaultOpen={defaultOpen}>
        <Fade className="flex h-full flex-1">
          <Sidebar collapsible="icon">
            <AppSidebar />
          </Sidebar>
          <SidebarInset className="bg-sidebar min-h-0 flex-1">
            <FadeLayout
              as="main"
              className="bg-background border-border m-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-4xl border md:ml-0"
            >
              {children}
            </FadeLayout>
          </SidebarInset>
        </Fade>
      </SidebarProvider>
    </UserProvider>
  )
}
