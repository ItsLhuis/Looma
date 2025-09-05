"use client"

import { useTheme } from "next-themes"

import Link from "next/link"

import {
  AuroraText,
  Button,
  Card,
  CardContent,
  Icon,
  InView,
  ThemeSwitcher,
  Typography
} from "@/components/ui"

type IconName = "Sparkles" | "Shield" | "Users" | "ArrowRight"

type Feature = {
  icon: IconName
  title: string
  subtitle: string
}

type Badge = {
  label: string
}

function FinalCtaSection() {
  const { theme, setTheme } = useTheme()

  const features: Feature[] = [
    {
      icon: "Sparkles",
      title: "Free to Start",
      subtitle: "No credit card required"
    },
    {
      icon: "Shield",
      title: "100% Private",
      subtitle: "Your data stays on your device"
    },
    {
      icon: "Users",
      title: "Instant Setup",
      subtitle: "Ready in seconds"
    }
  ]

  const badges: Badge[] = [{ label: "Security" }, { label: "Privacy" }, { label: "SOC 2" }]

  return (
    <section id="cta" className="relative overflow-hidden border-b py-24">
      <div className="relative container mx-auto px-6">
        <div className="mb-24 text-center">
          <InView direction="up" delay={0.1}>
            <Typography
              variant="h1"
              className="mb-12 text-3xl font-bold text-balance md:text-5xl lg:text-6xl"
            >
              Your Organized Life
              <br />
              <AuroraText className="mt-4 text-4xl md:text-6xl lg:text-7xl">Awaits</AuroraText>
            </Typography>
          </InView>
          <InView direction="up" delay={0.2}>
            <Typography
              variant="p"
              affects={["lead", "removePMargin"]}
              className="text-muted-foreground mx-auto max-w-4xl text-lg leading-relaxed text-pretty md:text-xl"
            >
              Stop living in chaos. Start with Looma today and transform every scattered thought
              into perfect clarity in seconds.
            </Typography>
          </InView>
        </div>
        <InView direction="up" delay={0.3}>
          <div className="mx-auto mb-16 max-w-4xl">
            <div className="grid gap-8 lg:grid-cols-3">
              {features.map((item, index) => (
                <InView key={index} direction="up" delay={0.1 * index}>
                  <Card className="bg-card border-border">
                    <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                      <div className="bg-primary/20 text-primary flex h-16 w-16 items-center justify-center rounded-2xl">
                        <Icon name={item.icon} className="h-8 w-8" />
                      </div>
                      <div>
                        <Typography variant="h4" className="text-base font-bold">
                          {item.title}
                        </Typography>
                        <Typography
                          variant="p"
                          affects="removePMargin"
                          className="text-muted-foreground mt-1 text-xs"
                        >
                          {item.subtitle}
                        </Typography>
                      </div>
                    </CardContent>
                  </Card>
                </InView>
              ))}
            </div>
          </div>
        </InView>
        <InView
          direction="up"
          delay={0.4}
          className="mb-8 flex flex-col items-center justify-center gap-6 sm:flex-row"
        >
          <Button size="lg" asChild>
            <Link href="/login">
              <Icon name="Sparkles" />
              Start Organizing Now
              <Icon name="ArrowRight" />
            </Link>
          </Button>
        </InView>
        <InView direction="up" delay={0.6} className="flex flex-col items-center gap-6">
          <div className="pt-6">
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
              {badges.map((badge, index) => (
                <div
                  key={index}
                  className="bg-card border-border flex h-10 w-28 items-center justify-center rounded-md border"
                >
                  <Typography affects="removePMargin" className="text-xs">
                    {badge.label}
                  </Typography>
                </div>
              ))}
            </div>
          </div>
          <ThemeSwitcher
            defaultValue="system"
            value={theme as "system" | "dark" | "light"}
            onChange={(theme) => setTheme(theme)}
          />
        </InView>
      </div>
    </section>
  )
}

export { FinalCtaSection }
