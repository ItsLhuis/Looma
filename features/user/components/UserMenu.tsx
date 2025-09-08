"use client"

import { useTheme } from "next-themes"

import { useIsMobile } from "@/hooks/useIsMobile"

import Link from "next/link"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
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
  Icon,
  Typography
} from "@/components/ui"

import { Button } from "@/components/ui/Button"

type UserMenuProps = {
  user: { name: string | null; email: string | null; image: string | null }
  variant?: "default" | "mini"
}

export function UserMenu({ user, variant = "default" }: UserMenuProps) {
  const { theme, setTheme } = useTheme()

  const isMobile = useIsMobile()

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)

  const renderTrigger = () => {
    if (variant === "mini") {
      if (isMobile) {
        return (
          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
            <Avatar className="size-7">
              <AvatarImage src={user?.image || undefined} alt={user?.name || ""} />
              <AvatarFallback className="text-xs">
                {user?.name ? getInitials(user.name) : "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        )
      } else {
        return (
          <Button variant="ghost" size="sm">
            <Avatar className="size-7">
              <AvatarImage src={user?.image || undefined} alt={user?.name || ""} />
              <AvatarFallback className="text-xs">
                {user?.name ? getInitials(user.name) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start overflow-hidden text-left">
              <Typography className="w-full max-w-24 truncate">{user?.name}</Typography>
            </div>
            <Icon name="ChevronDown" />
          </Button>
        )
      }
    }

    return (
      <Button variant="ghost" className="h-auto p-3">
        <Avatar>
          <AvatarImage src={user?.image || undefined} alt={user?.name || ""} />
          <AvatarFallback className="text-xs">
            {user?.name ? getInitials(user.name) : "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start gap-1 overflow-hidden text-left">
          <Typography className="w-full truncate">{user?.name}</Typography>
          <Typography className="w-full truncate" affects={["lead", "small"]}>
            {user?.email}
          </Typography>
        </div>
        <Icon name="ChevronRight" className="ml-auto" />
      </Button>
    )
  }

  const getDropdownSide = () => {
    if (variant === "mini") {
      return isMobile ? "bottom" : "bottom"
    }
    return "left"
  }

  const getDropdownAlign = () => {
    if (variant === "mini") {
      return isMobile ? "center" : "end"
    }
    return "end"
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{renderTrigger()}</DropdownMenuTrigger>
      <DropdownMenuContent align={getDropdownAlign()} side={getDropdownSide()} className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={user?.image || undefined} alt={user?.name || ""} />
            <AvatarFallback className="text-xs">
              {user?.name ? getInitials(user.name) : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start gap-1 overflow-hidden text-left">
            <Typography className="w-full truncate">{user?.name}</Typography>
            <Typography className="w-full truncate" affects={["lead", "small"]}>
              {user?.email}
            </Typography>
          </div>
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
        <DropdownMenuItem>
          <Icon name="LogOut" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
