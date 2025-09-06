"use client"

import { useState } from "react"

import Image from "next/image"
import Link from "next/link"

import { ArrowRight, Menu } from "lucide-react"

import {
  Button,
  Drawer,
  DrawerContent,
  DrawerTrigger,
  InView,
  ResizableNavbar
} from "@/components/ui"

const navbarConfig: {
  logo: { src: string; alt: string; width: number; height: number }
  links: { href: string; label: string }[]
  cta: { href: string; label: string; icon: React.ElementType }
} = {
  logo: {
    src: "/icon.png",
    alt: "Logo",
    width: 40,
    height: 40
  },
  links: [
    { href: "#home", label: "Home" },
    { href: "#problems", label: "Problems" },
    { href: "#value", label: "Value" },
    { href: "#demo", label: "Demo" },
    { href: "#cta", label: "Get Started" }
  ],
  cta: {
    href: "/login",
    label: "Get Started",
    icon: ArrowRight
  }
}

const Navbar = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleLinkClick = () => {
    setIsDrawerOpen(false)
  }

  return (
    <ResizableNavbar className="flex items-center px-6">
      <InView>
        <Image
          src={navbarConfig.logo.src}
          alt={navbarConfig.logo.alt}
          width={navbarConfig.logo.width}
          height={navbarConfig.logo.height}
        />
      </InView>
      <nav className="absolute left-1/2 hidden -translate-x-1/2 transform lg:flex">
        <InView>
          <ul className="flex items-center space-x-6">
            {navbarConfig.links.map((link, index) => (
              <li key={index}>
                <Button asChild variant="ghost">
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              </li>
            ))}
          </ul>
        </InView>
      </nav>
      <div className="ml-auto hidden lg:flex">
        <InView>
          <Button size="sm" asChild>
            <Link href={navbarConfig.cta.href}>
              {navbarConfig.cta.label} <navbarConfig.cta.icon />
            </Link>
          </Button>
        </InView>
      </div>
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <InView className="flex lg:hidden">
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu />
            </Button>
          </DrawerTrigger>
        </InView>
        <DrawerContent>
          <div className="space-y-4 p-6">
            <div className="space-y-3">
              {navbarConfig.links.map((link, index) => (
                <Button
                  key={index}
                  asChild
                  variant="ghost"
                  className="w-full justify-start text-lg"
                  onClick={handleLinkClick}
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              ))}
            </div>
            <div className="border-t pt-4">
              <Button asChild className="w-full" onClick={handleLinkClick}>
                <Link href={navbarConfig.cta.href}>
                  {navbarConfig.cta.label} <navbarConfig.cta.icon />
                </Link>
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </ResizableNavbar>
  )
}

export { Navbar }
