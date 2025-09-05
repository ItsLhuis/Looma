import { Brain, Shield, Zap } from "lucide-react"

import Image from "next/image"

import { AuroraText, Icon, InView, Typography } from "@/components/ui"

type Proposition = {
  icon: React.ReactNode
  title: string
  subtitle: string
  description: string
  image: string
  features: string[]
}

function ValuePropositionSection() {
  const propositions: Proposition[] = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Instant Organization",
      subtitle: "Any input, perfect organization in seconds",
      description:
        "Take a photo of messy handwritten notes and watch them transform into beautifully organized digital task lists. Our AI reads any handwriting, no matter how chaotic.",
      image: "/photo-transform.jpg",
      features: [
        "Reads any handwriting style",
        "Works with whiteboards & notes",
        "Instant digital conversion",
        "Maintains original context"
      ]
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI That Actually Learns",
      subtitle: "Understands your life, adapts to your style",
      description:
        "The more you use Looma, the smarter it gets. It learns your patterns, preferences, and priorities to provide increasingly personalized organization.",
      image: "/ai-brain.jpg",
      features: [
        "Learns your preferences",
        "Adapts to your workflow",
        "Proactive suggestions",
        "Contextual intelligence"
      ]
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Complete Privacy",
      subtitle: "Works offline, your data stays yours",
      description:
        "All AI processing happens on your device. Your personal information never leaves your phone or computer. True privacy by design.",
      image: "/voice-transform.jpg",
      features: [
        "100% offline processing",
        "Zero data collection",
        "Military-grade encryption",
        "You own your data"
      ]
    }
  ]

  return (
    <section id="value" className="relative overflow-hidden border-b py-24">
      <div className="relative container mx-auto px-6">
        <div className="mb-24 text-center">
          <InView direction="up" delay={0}>
            <Typography
              variant="h1"
              className="text-muted-foreground mb-12 text-3xl font-bold text-balance md:text-5xl lg:text-6xl"
            >
              Why Looma Changes
              <br />
              <AuroraText className="mt-4 text-4xl md:text-6xl lg:text-7xl">Everything</AuroraText>
            </Typography>
          </InView>
          <InView direction="up" delay={0.2}>
            <Typography
              variant="p"
              affects={["lead", "removePMargin"]}
              className="mx-auto max-w-4xl text-lg leading-relaxed text-pretty md:text-xl"
            >
              Three revolutionary capabilities that transform how you organize your life. Experience
              the future of personal productivity.
            </Typography>
          </InView>
        </div>
        <div className="mx-auto max-w-7xl space-y-32">
          {propositions.map((prop, index) => (
            <InView key={index} direction="up" delay={0.4 + index * 0.2}>
              <div
                className={`grid items-center gap-16 lg:grid-cols-2 ${
                  index % 2 === 1 ? "lg:grid-flow-col-dense" : ""
                }`}
              >
                <div className={`space-y-8 ${index % 2 === 1 ? "lg:col-start-2" : ""}`}>
                  <div className="space-y-6">
                    <div className="flex items-start gap-6">
                      <div className="bg-card border-border text-primary flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border">
                        {prop.icon}
                      </div>
                      <div className="flex-1 space-y-2">
                        <Typography variant="h3" className="text-2xl font-bold lg:text-3xl">
                          {prop.title}
                        </Typography>
                        <Typography
                          variant="p"
                          className="text-md font-medium"
                          affects={"removePMargin"}
                        >
                          {prop.subtitle}
                        </Typography>
                      </div>
                    </div>
                    <Typography
                      variant="p"
                      affects={["removePMargin"]}
                      className="text-muted-foreground text-lg leading-relaxed"
                    >
                      {prop.description}
                    </Typography>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {prop.features.map((feature, featureIndex) => (
                        <InView key={featureIndex} direction="left" delay={0.1 * featureIndex}>
                          <div className="bg-card border-border flex items-center gap-3 rounded-lg border p-3">
                            <Icon
                              name="CheckCircle"
                              className="text-primary h-5 w-5 flex-shrink-0"
                            />
                            <Typography className="text-sm font-medium">{feature}</Typography>
                          </div>
                        </InView>
                      ))}
                    </div>
                  </div>
                </div>
                <div className={`${index % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""}`}>
                  <InView direction={index % 2 === 1 ? "left" : "right"} delay={0.6}>
                    <div className="relative">
                      <div className="from-primary/10 absolute inset-0 rounded-2xl bg-gradient-to-br to-transparent opacity-50 blur-3xl" />
                      <div className="relative transform overflow-hidden rounded-2xl border object-cover">
                        <Image
                          width={600}
                          height={400}
                          src={prop.image}
                          alt={prop.title}
                          className="h-80 w-full object-cover"
                        />
                      </div>
                    </div>
                  </InView>
                </div>
              </div>
            </InView>
          ))}
        </div>
        <InView direction="up" delay={0.8}>
          <div className="mt-24 text-center">
            <div className="bg-card text-card-foreground border-border inline-flex items-center gap-3 rounded-full border px-6 py-4">
              <Typography
                affects="small"
                className="text-muted-foreground flex items-center gap-3 font-medium"
              >
                <Icon name="Zap" className="text-primary h-6 w-6" />
                Ready to experience the transformation?
              </Typography>
            </div>
          </div>
        </InView>
      </div>
    </section>
  )
}

export { ValuePropositionSection }
