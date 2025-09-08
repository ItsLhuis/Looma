"use client"

import Link from "next/link"

import { usePathname } from "next/navigation"

import { Breadcrumb, Typography } from "@/components/ui"

function capitalize(word: string) {
  if (!word) return ""
  return word.charAt(0).toUpperCase() + word.slice(1)
}

function AppBreadcrumb() {
  const pathname = usePathname()

  const segments = pathname.split("?")[0].split("#")[0].split("/").filter(Boolean)

  const crumbs = segments.map((seg, idx) => {
    const href = "/" + segments.slice(0, idx + 1).join("/")
    return { label: capitalize(seg.replaceAll("-", " ")), href }
  })

  return (
    <Breadcrumb className="flex items-center gap-2 text-sm">
      {crumbs.length === 0 ? (
        <Typography>Home</Typography>
      ) : (
        crumbs.map((c, i) => (
          <span key={c.href} className="inline-flex items-center gap-2">
            {i > 0 && <span className="text-muted-foreground">/</span>}
            {i < crumbs.length - 1 ? (
              <Link href={c.href} className="hover:underline">
                {c.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{c.label}</span>
            )}
          </span>
        ))
      )}
    </Breadcrumb>
  )
}

export { AppBreadcrumb }
