import { type ReactNode } from "react"

import { getUser } from "@/lib/dal"

import { redirect } from "next/navigation"

import {
  Fade,
  FadeLayout,
  IconProps,
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui"

import { UserMenu } from "@/features/user/components"

import { AppSidebar } from "@/components/layout"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getUser()

  if (!user) {
    redirect("/sign-in")
  }

  const navigationItems: { href: string; icon: IconProps["name"]; label: string }[] = [
    { href: "/home", icon: "Home", label: "Home" },
    { href: "/notes", icon: "Notebook", label: "Notes" },
    { href: "/tasks", icon: "CheckSquare", label: "Tasks" },
    { href: "/calendar", icon: "Calendar", label: "Calendar" },
    { href: "/categories", icon: "Tag", label: "Categories" }
  ]

  return (
    <SidebarProvider>
      <Fade className="flex flex-1">
        <Sidebar>
          <AppSidebar
            items={navigationItems}
            user={{
              name: user?.name ?? null,
              email: user?.email ?? null,
              image: user?.image ?? null
            }}
          />
        </Sidebar>
        <SidebarInset>
          <header className="bg-sidebar sticky top-0 z-20 flex h-12 items-center justify-between border-b px-3">
            <div className="flex items-center justify-center gap-3">
              <SidebarTrigger />
            </div>
            <UserMenu
              variant="mini"
              user={{
                name: user?.name ?? null,
                email: user?.email ?? null,
                image: user?.image ?? null
              }}
            />
          </header>
          <FadeLayout as="main" className="flex flex-1">
            {children}
          </FadeLayout>
        </SidebarInset>
      </Fade>
    </SidebarProvider>
  )
}
