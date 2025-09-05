import Link from "next/link"

import { AuroraText, Button, Icon, InView, LightRays, Typography } from "@/components/ui"

function HeroSection() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden border-b"
    >
      <div className="absolute inset-0 z-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#7E48FF"
          raysSpeed={1.5}
          lightSpread={1.2}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
        />
      </div>
      <div className="relative z-10 container mx-auto px-6 py-24">
        <div className="mx-auto max-w-6xl space-y-16">
          <InView direction="down" delay={0} className="mt-0 flex justify-center lg:mt-16">
            <div className="border-primary text-primary inline-flex items-center gap-3 rounded-full border px-6 py-3 backdrop-blur-sm">
              <Icon name="Sparkles" />
              <Typography affects="small">AI-Powered</Typography>
            </div>
          </InView>
          <div className="space-y-3 text-center">
            <InView direction="up" delay={0.2}>
              <Typography
                variant="h1"
                className="text-6xl font-black md:text-7xl lg:text-8xl xl:text-9xl"
              >
                <AuroraText className="mb-12">Looma</AuroraText>
                <Typography className="block text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
                  The AI That
                </Typography>
                <Typography className="block text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
                  Organizes Your Life
                </Typography>
              </Typography>
            </InView>
            <InView direction="up" delay={0.4}>
              <Typography
                variant="p"
                affects={["lead", "removePMargin"]}
                className="text-muted-foreground mx-auto mt-16 max-w-4xl"
              >
                Transform any chaos into perfect clarity in seconds.
              </Typography>
            </InView>
            <InView direction="up" delay={0.6}>
              <Typography
                variant="p"
                affects={["removePMargin"]}
                className="flex flex-wrap items-center justify-center gap-3"
              >
                <Typography affects={["bold", "large"]}>Photo, voice, or text</Typography>
                <Icon name="ArrowRight" />
                <Typography affects={["bold", "large"]}>AI</Typography>
                <Icon name="ArrowRight" />
                <Typography affects={["bold", "large"]}>Organized life</Typography>
              </Typography>
            </InView>
          </div>
          <InView direction="up" delay={0.8}>
            <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:gap-8 lg:gap-12">
              <div className="group flex flex-col items-center gap-3">
                <div className="bg-card/80 text-card-foreground border-border flex h-16 w-16 items-center justify-center rounded-3xl border backdrop-blur-sm">
                  <Icon name="Camera" className="text-primary h-6 w-6" />
                </div>
                <Typography affects="small">Capture</Typography>
              </div>
              <div className="flex items-center">
                <Icon name="ArrowRight" />
              </div>
              <div className="group flex flex-col items-center gap-3">
                <div className="bg-card/80 text-card-foreground border-border flex h-16 w-16 items-center justify-center rounded-3xl border backdrop-blur-sm">
                  <Icon name="Mic" className="text-primary h-6 w-6" />
                </div>
                <Typography affects="small">Voice</Typography>
              </div>
              <div className="flex items-center">
                <Icon name="ArrowRight" />
              </div>
              <div className="group flex flex-col items-center gap-3">
                <div className="bg-card/80 text-card-foreground border-border flex h-16 w-16 items-center justify-center rounded-3xl border backdrop-blur-sm">
                  <Icon name="Sparkles" className="text-primary h-6 w-6" />
                </div>
                <Typography affects="small">Organized</Typography>
              </div>
            </div>
          </InView>
          <InView direction="up" delay={1.0}>
            <div className="flex justify-center">
              <Button size="lg" asChild>
                <Link href="/login">
                  Start Organizing Instantly
                  <Icon name="ArrowRight" />
                </Link>
              </Button>
            </div>
          </InView>
          <InView direction="up" delay={1.2}>
            <div className="flex justify-center">
              <div className="bg-card text-card-foreground border-border inline-flex items-center gap-3 rounded-full border px-6 py-4">
                <Icon name="Brain" className="text-primary h-6 w-6" />
                <Typography
                  affects="small"
                  className="text-muted-foreground flex items-center gap-3 font-medium"
                >
                  <Typography variant="h1">∞</Typography>
                  hours saved daily
                </Typography>
              </div>
            </div>
          </InView>
        </div>
      </div>
    </section>
  )
}

export { HeroSection }
