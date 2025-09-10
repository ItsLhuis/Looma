import { type ReactNode } from "react"

import { cookies } from "next/headers"

import { getUser } from "@/lib/dal"

import { redirect } from "next/navigation"

import { Fade, FadeLayout, Sidebar, SidebarInset, SidebarProvider } from "@/components/ui"

import { Sidebar as AppSidebar } from "@/components/layout"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getUser()

  if (!user) {
    redirect("/sign-in")
  }

  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar.state")?.value === "true"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
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
  )
}
