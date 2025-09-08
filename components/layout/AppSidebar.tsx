"use client"

import { usePathname } from "next/navigation"

import Image from "next/image"
import Link from "next/link"

import {
  AuroraText,
  Button,
  Icon,
  type IconProps,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
  Typography
} from "@/components/ui"
import { UserMenu } from "@/features/user/components"

export type NavItem = { href: string; icon: IconProps["name"]; label: string }

type AppSidebarProps = {
  items: NavItem[]
  user: { name: string | null; email: string | null; image: string | null }
}

function AppSidebar({ items, user }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      <SidebarHeader className="flex h-12 items-start justify-center border-b p-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/icon.png" alt="Looma" width={24} height={24} />
          <Typography variant="h5">
            <AuroraText>Looma</AuroraText>
          </Typography>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} className="block w-full">
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className="w-full justify-start px-2"
                      data-active={isActive}
                    >
                      <span className="flex w-full items-center gap-2">
                        <Icon name={item.icon} />
                        <span>{item.label}</span>
                      </span>
                    </Button>
                  </Link>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <UserMenu user={user} />
      </SidebarFooter>
      <SidebarRail />
    </>
  )
}

export { AppSidebar }
