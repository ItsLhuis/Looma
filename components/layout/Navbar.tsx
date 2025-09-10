"use client"

import { type ReactNode } from "react"

import { cn } from "@/lib/utils"

import { SidebarTrigger, useSidebar } from "@/components/ui/Sidebar"
import { Typography } from "@/components/ui/Typography"

export type NavbarProps = {
  title: string
  padding?: "none" | "sm" | "md"
  className?: string
  children?: ReactNode
}

function Navbar({ title = "Home", padding = "md", className, children }: NavbarProps) {
  const { isMobile } = useSidebar()

  const paddingClasses =
    padding === "none" ? "p-0" : padding === "sm" ? "p-4 sm:p-5 lg:p-6" : "p-4 sm:p-6 lg:p-8"

  return (
    <header
      className={cn(
        "flex w-full items-center justify-between gap-3 border-b",
        paddingClasses,
        className
      )}
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
