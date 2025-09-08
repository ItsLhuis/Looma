"use client"

import { usePathname } from "next/navigation"

import { Fade, FadeProps } from "@/components/ui/Fade"

export type FadeLayoutProps = FadeProps

function FadeLayout({ children, ...props }: FadeLayoutProps) {
  const pathname = usePathname()

  return (
    <Fade key={pathname} {...props}>
      {children}
    </Fade>
  )
}

export { FadeLayout }
