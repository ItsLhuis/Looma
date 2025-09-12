import { type ReactNode } from "react"

import { type Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"

import { QueryProvider } from "@/contexts/QueryClientProvider"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { NuqsAdapter } from "nuqs/adapters/next/app"

import { Button, Toaster } from "@/components/ui"

import "./globals.css"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
  preload: true
})

export const metadata: Metadata = {
  title: {
    default: "Looma AI - The AI That Organizes Your Life",
    template: "%s | Looma AI"
  },
  description:
    "Transform chaos into clarity with Looma AI. Photo, voice, or text → AI → Organized life. The smart personal assistant that understands everything and organizes instantly.",
  keywords: [
    "AI personal assistant",
    "automatic organization",
    "task management AI",
    "photo to text",
    "voice to tasks",
    "personal productivity",
    "AI organizer",
    "smart scheduling",
    "offline AI assistant"
  ],
  authors: [{ name: "ItsLhuis" }],
  creator: "ItsLhuis",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} h-screen scroll-smooth`}
    >
      <body className={`${plusJakartaSans.className} h-full antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Button
            asChild
            className="focus:bg-primary sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:px-4 focus:py-2"
          >
            <a href="#main">Skip to main content</a>
          </Button>
          <QueryProvider>
            <NuqsAdapter>
              <main id="main" className="flex h-full flex-col">
                {children}
              </main>
            </NuqsAdapter>
          </QueryProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
