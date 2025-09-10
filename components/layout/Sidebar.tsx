"use client"

import { usePathname } from "next/navigation"
import { useState } from "react"

import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

import Image from "next/image"
import Link from "next/link"

import {
  AuroraText,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Fade,
  Icon,
  type IconProps,
  LogoutDialog,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  Typography,
  useSidebar
} from "@/components/ui"

type NavItem = { href: string; icon: IconProps["name"]; label: string }

export type SidebarProps = {
  user: { name: string | null; email: string | null; image: string | null }
}

const items: NavItem[] = [
  { href: "/home", icon: "Home", label: "Home" },
  { href: "/notes", icon: "Notebook", label: "Notes" },
  { href: "/tasks", icon: "CheckSquare", label: "Tasks" },
  { href: "/calendar", icon: "Calendar", label: "Calendar" },
  { href: "/categories", icon: "Tag", label: "Categories" }
]

function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  const { state, isMobile, setOpenMobile } = useSidebar()

  const { theme, setTheme } = useTheme()

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)

  const isExpanded = state === "expanded"

  const UserAvatar = ({ className }: { className?: string }) => (
    <Avatar className={className}>
      <AvatarImage src={user?.image || undefined} alt={user?.name || ""} />
      <AvatarFallback className="text-xs">
        {user?.name ? getInitials(user.name) : "U"}
      </AvatarFallback>
    </Avatar>
  )

  const UserInfo = () => (
    <div className="flex flex-col items-start gap-1 overflow-hidden text-left">
      <Typography className="w-full truncate">{user?.name}</Typography>
      <Typography className="w-full truncate" affects={["lead", "small"]}>
        {user?.email}
      </Typography>
    </div>
  )

  const DropdownMenuItems = () => (
    <>
      <DropdownMenuLabel className="flex items-center gap-2">
        <UserAvatar />
        <UserInfo />
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="flex items-center gap-2">
          <Icon name="SunMoon" />
          Theme
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuRadioGroup
            value={theme}
            onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
          >
            <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuItem asChild>
        <Link href="/settings" className="flex items-center gap-2">
          <Icon name="Settings" />
          Settings
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => setLogoutDialogOpen(true)}>
        <Icon name="LogOut" />
        Logout
      </DropdownMenuItem>
    </>
  )

  if (isMobile) {
    return (
      <>
        <SidebarHeader className="flex h-12 items-start justify-center p-3">
          <div className="relative flex w-full items-center justify-between gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/icon.png" alt="Looma" width={24} height={24} />
              <Typography variant="h5">
                <AuroraText>Looma</AuroraText>
              </Typography>
            </Link>
            <SidebarTrigger className="absolute right-0" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation Tools</SidebarGroupLabel>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <SidebarMenuItem key={item.href}>
                    <Link href={item.href} tabIndex={-1}>
                      <SidebarMenuButton
                        isActive={isActive}
                        data-active={isActive}
                        tooltip={item.label}
                        onClick={() => {
                          setOpenMobile(false)
                        }}
                      >
                        <Icon name={item.icon} />
                        {item.label}
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Link href="/settings">
            <Button
              variant="ghost"
              className="h-auto w-full p-3"
              onClick={() => {
                setOpenMobile(false)
              }}
            >
              <UserAvatar />
              <div className="flex w-full items-center justify-between">
                <UserInfo />
                <Icon name="Settings" />
              </div>
            </Button>
          </Link>
        </SidebarFooter>
        <LogoutDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen} />
      </>
    )
  }

  return (
    <>
      <SidebarHeader className="flex h-12 items-start justify-center p-3">
        <div className="relative flex w-full items-center justify-between gap-2">
          <Fade show={isMobile || isExpanded} initial={false}>
            <Link href="/" className="flex items-center gap-2">
              <Image src="/icon.png" alt="Looma" width={24} height={24} />
              <Typography variant="h5">
                <AuroraText>Looma</AuroraText>
              </Typography>
            </Link>
          </Fade>
          <SidebarTrigger className="absolute right-0" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation Tools</SidebarGroupLabel>
          <SidebarMenu>
            {items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} tabIndex={-1}>
                    <SidebarMenuButton
                      isActive={isActive}
                      data-active={isActive}
                      tooltip={item.label}
                    >
                      <Icon name={item.icon} />
                      {item.label}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={cn("h-auto w-full p-3", !isExpanded && "my-3 p-0")}>
              <UserAvatar className={isMobile ? "" : !isExpanded ? "mx-auto" : ""} />
              {isMobile ? (
                <div className="flex w-full items-center justify-between">
                  <UserInfo />
                  <Icon name="ChevronRight" />
                </div>
              ) : (
                isExpanded && (
                  <div className="flex w-full items-center justify-between">
                    <UserInfo />
                    <Icon name="ChevronRight" />
                  </div>
                )
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side={isExpanded ? "left" : "right"} className="w-56">
            <DropdownMenuItems />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
      <LogoutDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen} />
    </>
  )
}

export { Sidebar }
