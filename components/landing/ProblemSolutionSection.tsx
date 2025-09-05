import { AuroraText, Icon, InView, Typography } from "@/components/ui"

type Problem = {
  text: string
}

type Solution = {
  text: string
}

type Stat = {
  metric: string
  label: string
}

function ProblemSolutionSection() {
  const problems: Problem[] = [
    { text: "Scattered notes across 5+ apps" },
    { text: "Forgotten tasks and missed deadlines" },
    { text: "Messy handwriting you can't find" },
    { text: "Voice memos lost in the void" },
    { text: "Overwhelmed by digital chaos" }
  ]

  const solutions: Solution[] = [
    { text: "One AI that understands everything" },
    { text: "Automatic reminders and scheduling" },
    { text: "Perfect text from any handwriting" },
    { text: "Voice instantly becomes organized tasks" },
    { text: "Clear, actionable organization" }
  ]

  const stats: Stat[] = [
    { metric: "90%", label: "Less time searching" },
    { metric: "5x", label: "Faster task creation" },
    { metric: "100%", label: "Never miss deadlines" },
    { metric: "∞", label: "Peace of mind" }
  ]

  return (
    <section id="problems" className="bg-secondary/30 relative overflow-hidden border-b py-24">
      <div className="relative container mx-auto px-6">
        <div className="mb-24 text-center">
          <InView direction="up" delay={0}>
            <Typography
              variant="h1"
              className="mb-12 text-3xl font-bold text-balance md:text-5xl lg:text-6xl"
            >
              Stop Juggling 5+ Apps
              <br />
              <AuroraText className="mt-4 text-4xl md:text-6xl lg:text-7xl">
                Start Living Organized
              </AuroraText>
            </Typography>
          </InView>
          <InView direction="up" delay={0.2}>
            <Typography
              variant="p"
              affects={["lead", "removePMargin"]}
              className="text-muted-foreground mx-auto max-w-4xl text-lg leading-relaxed text-pretty md:text-xl"
            >
              The chaos ends here. See how Looma transforms your scattered digital life into a
              beautifully organized system that actually works.
            </Typography>
          </InView>
        </div>
        <InView direction="up" delay={0.4}>
          <div className="mx-auto mb-24 grid max-w-7xl items-center gap-8 lg:grid-cols-3">
            <div className="space-y-6">
              <Typography variant="h3" className="mb-6 text-center text-2xl font-bold lg:text-left">
                The Chaos You Know
              </Typography>
              {problems.map((problem, index) => (
                <InView key={index} direction="left" delay={0.1 * index}>
                  <div className="bg-card border-border flex items-center gap-4 rounded-xl border p-4">
                    <Icon name="XCircle" className="text-destructive h-6 w-6 flex-shrink-0" />
                    <Typography className="text-foreground">{problem.text}</Typography>
                  </div>
                </InView>
              ))}
            </div>
            <div className="hidden items-start justify-center pt-16 lg:flex">
              <div className="border-border bg-card text-card-foreground flex h-24 w-24 flex-col items-center justify-center rounded-full border">
                <Icon name="ArrowRight" className="text-primary mb-1 h-6 w-6" />
                <Typography className="text-primary text-xs font-bold">Looma</Typography>
              </div>
            </div>
            <div className="mt-6 space-y-6 lg:mt-0">
              <Typography
                variant="h3"
                className="mb-6 text-center text-2xl font-bold lg:text-right"
              >
                The Clarity You Deserve
              </Typography>
              {solutions.map((solution, index) => (
                <InView key={index} direction="right" delay={0.1 * index}>
                  <div className="bg-card border-primary/20 flex items-center gap-4 rounded-xl border p-4">
                    <Icon name="CheckCircle" className="text-primary h-6 w-6 flex-shrink-0" />
                    <Typography className="text-foreground">{solution.text}</Typography>
                  </div>
                </InView>
              ))}
            </div>
          </div>
        </InView>
        <InView direction="up" delay={0.6}>
          <div className="mx-auto mt-32 max-w-6xl">
            <div className="mb-16 text-center">
              <Typography variant="h3" className="mb-4 text-3xl font-bold md:text-4xl">
                The Results Speak for Themselves
              </Typography>
              <Typography variant="p" className="text-muted-foreground mx-auto max-w-2xl text-lg">
                Real improvements that transform how you work and live
              </Typography>
            </div>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat, index) => (
                <InView key={index} direction="up" delay={1.0 + 0.1 * index}>
                  <div className="bg-card text-card-foreground border-border hover:border-primary/20 flex flex-col items-center justify-center rounded-2xl border p-10 text-center transition-colors duration-300">
                    <Typography className="text-primary mb-4 text-5xl font-bold md:text-6xl">
                      {stat.metric}
                    </Typography>
                    <Typography>{stat.label}</Typography>
                  </div>
                </InView>
              ))}
            </div>
          </div>
        </InView>
      </div>
    </section>
  )
}

export { ProblemSolutionSection }
