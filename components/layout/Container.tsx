"use client"

import { type ReactNode } from "react"

import { cn } from "@/lib/utils"

import { ScrollArea } from "@/components/ui/ScrollArea"

export type ContainerProps = {
  className?: string
  children: ReactNode
  padding?: "none" | "sm" | "md"
  withScroll?: boolean
  contentClassName?: string
  ref?: React.Ref<HTMLDivElement>
}

function Container({
  className,
  children,
  padding = "md",
  withScroll = true,
  contentClassName,
  ref
}: ContainerProps) {
  const paddingClasses =
    padding === "none" ? "p-0" : padding === "sm" ? "p-4 sm:p-5 lg:p-6" : "p-4 sm:p-6 lg:p-8"

  if (withScroll) {
    return (
      <div ref={ref} className={cn("min-h-0 flex-1", className)}>
        <ScrollArea className="h-full">
          <div className={cn("h-full", paddingClasses, contentClassName)}>{children}</div>
        </ScrollArea>
      </div>
    )
  }

  return (
    <div ref={ref} className={cn("min-h-0 flex-1", paddingClasses, className)}>
      {children}
    </div>
  )
}

export { Container }
