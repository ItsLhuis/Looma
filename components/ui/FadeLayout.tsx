"use client"

import { usePathname } from "next/navigation"

import { Fade, FadeProps } from "@/components/ui/Fade"

export type FadeLayoutProps = FadeProps

function FadeLayout({ children }: FadeLayoutProps) {
  const pathname = usePathname()

  return <Fade key={pathname}>{children}</Fade>
}

export { FadeLayout }
