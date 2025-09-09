"use client"

import { type ReactNode } from "react"

import { cn } from "@/lib/utils"

import { SidebarTrigger, useSidebar } from "@/components/ui/Sidebar"
import { Typography } from "@/components/ui/Typography"

export type NavbarProps = {
  title: string
  className?: string
  children?: ReactNode
}

function Navbar({ title = "Home", className, children }: NavbarProps) {
  const { isMobile } = useSidebar()

  return (
    <header
      className={cn("flex h-12 w-full items-center justify-between gap-3 border-b px-3", className)}
    >
      <div className="flex items-center gap-3">
        {isMobile && <SidebarTrigger />}
        <Typography variant="h3" affects={"bold"}>
          {title}
        </Typography>
      </div>
      {children}
    </header>
  )
}

export { Navbar }
