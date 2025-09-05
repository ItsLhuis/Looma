"use client"

import { useState } from "react"

import {
  AuroraText,
  Card,
  CardContent,
  Icon,
  InView,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Typography
} from "@/components/ui"

type DemoType = "photo" | "voice" | "text"

type Demo = {
  key: DemoType
  icon: React.ReactNode
  title: string
  subtitle: string
  description: string
  input: {
    type: string
    title: string
    content: string
  }
  processing: string
  output: {
    title: string
    tasks: Array<{
      task: string
      date: string
      assignee: string
      priority: string
    }>
    project?: {
      name: string
      budget: string
      target: string
    }
    shopping?: string[]
    event?: {
      name: string
      date: string
      tasks: string[]
    }
  }
}

function InteractiveDemoSection() {
  const [activeDemo, setActiveDemo] = useState<DemoType>("photo")

  const demos: Demo[] = [
    {
      key: "photo",
      icon: <Icon name="Camera" className="h-6 w-6" />,
      title: "Photo Recognition",
      subtitle: "Snap, scan, organize instantly",
      description: "Transform messy handwritten notes into perfectly structured digital tasks",
      input: {
        type: "image",
        title: "Handwritten Meeting Notes",
        content: `Project Alpha kickoff
                  - Design review Friday 2pm  
                  - Sarah: user research by Wed
                  - Mike: wireframes next week
                  - Budget: $50k approved
                  - Launch target: Q2 2024`
      },
      processing: "Analyzing handwriting and extracting insights...",
      output: {
        title: "Organized Project Plan",
        tasks: [
          {
            task: "Design review meeting",
            date: "Friday 2:00 PM",
            assignee: "Team",
            priority: "high"
          },
          {
            task: "Complete user research",
            date: "Wednesday",
            assignee: "Sarah",
            priority: "medium"
          },
          {
            task: "Create wireframes",
            date: "Next week",
            assignee: "Mike",
            priority: "medium"
          }
        ],
        project: {
          name: "Project Alpha",
          budget: "$50,000",
          target: "Q2 2024"
        }
      }
    },
    {
      key: "voice",
      icon: <Icon name="Mic" className="h-6 w-6" />,
      title: "Voice Processing",
      subtitle: "Speak naturally, organize effortlessly",
      description: "Convert spoken thoughts into actionable, time-aware task lists",
      input: {
        type: "audio",
        title: "Voice Recording",
        content: `"Hey Looma, I need to call the dentist tomorrow at 9am to reschedule. Also remind me to pick up groceries after work - milk, eggs, and bread. Oh and email the client about the proposal by Friday."`
      },
      processing: "Converting speech to organized structure...",
      output: {
        title: "Smart Schedule & Reminders",
        tasks: [
          {
            task: "Call dentist to reschedule",
            date: "Tomorrow 9:00 AM",
            assignee: "You",
            priority: "high"
          },
          {
            task: "Pick up groceries",
            date: "After work today",
            assignee: "You",
            priority: "low"
          },
          {
            task: "Email client about proposal",
            date: "Friday EOD",
            assignee: "You",
            priority: "high"
          }
        ],
        shopping: ["Milk", "Eggs", "Bread"]
      }
    },
    {
      key: "text",
      icon: <Icon name="Type" className="h-6 w-6" />,
      title: "Natural Language",
      subtitle: "Type anything, get perfect organization",
      description: "Turn overwhelming text dumps into clear, prioritized action plans",
      input: {
        type: "text",
        title: "Stream of Consciousness",
        content: `I'm so overwhelmed with everything this week. Presentation Thursday for marketing team about Q1 results. Need slides and practice. Sister's birthday party Saturday, buy gift and help decorations. Doctor appointment Tuesday morning. Review John's code by Wednesday.`
      },
      processing: "Understanding context and extracting priorities...",
      output: {
        title: "Weekly Priority Plan",
        tasks: [
          {
            task: "Doctor appointment",
            date: "Tuesday morning",
            assignee: "You",
            priority: "high"
          },
          {
            task: "Review John's code",
            date: "Wednesday EOD",
            assignee: "You",
            priority: "high"
          },
          {
            task: "Finish presentation slides",
            date: "Before Thursday",
            assignee: "You",
            priority: "high"
          },
          {
            task: "Buy birthday gift",
            date: "Before Saturday",
            assignee: "You",
            priority: "medium"
          }
        ],
        event: {
          name: "Sister's Birthday Party",
          date: "Saturday",
          tasks: ["Buy gift", "Help with decorations"]
        }
      }
    }
  ]

  const currentDemo = demos.find((demo) => demo.key === activeDemo) || demos[0]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-error-foreground bg-error border-error-border"
      case "medium":
        return "text-warning-foreground bg-warning border-warning-border"
      case "low":
        return "text-success-foreground bg-success border-success-border"
      default:
        return "text-muted-foreground bg-muted border-border"
    }
  }

  return (
    <section id="demo" className="bg-secondary/30 relative overflow-hidden border-b py-24">
      <div className="relative container mx-auto px-6">
        <div className="mb-24 text-center">
          <InView direction="up" delay={0}>
            <Typography
              variant="h1"
              className="mb-12 text-3xl font-bold text-balance md:text-5xl lg:text-6xl"
            >
              See Looma Transform
              <br />
              <AuroraText className="mt-4 text-4xl md:text-6xl lg:text-7xl">Your Chaos</AuroraText>
            </Typography>
          </InView>
          <InView direction="up" delay={0.2}>
            <Typography
              variant="p"
              affects={["lead", "removePMargin"]}
              className="mx-auto max-w-4xl text-lg leading-relaxed text-pretty md:text-xl"
            >
              Choose your input method and watch real chaos become perfect organization. Experience
              the magic that happens in seconds.
            </Typography>
          </InView>
        </div>
        <div className="mx-auto max-w-7xl">
          <Tabs
            value={activeDemo}
            onValueChange={(value) => setActiveDemo(value as DemoType)}
            className="w-full"
          >
            <InView direction="up" delay={0.4}>
              <TabsList className="bg-card border-border mb-16 grid h-auto w-full grid-cols-1 gap-4 border p-2 lg:grid-cols-3">
                {demos.map((demo) => (
                  <TabsTrigger
                    key={demo.key}
                    value={demo.key}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex flex-col items-center gap-4 p-8 transition-all"
                  >
                    <div className="bg-card border-border flex h-16 w-16 items-center justify-center rounded-2xl border">
                      {demo.icon}
                    </div>
                    <div className="text-center">
                      <Typography variant="h4" className="text-base font-bold">
                        {demo.title}
                      </Typography>
                      <Typography
                        variant="p"
                        affects="removePMargin"
                        className="text-muted-foreground mt-1 text-xs"
                      >
                        {demo.subtitle}
                      </Typography>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </InView>
            <TabsContent value={activeDemo}>
              <InView direction="up" delay={0.6}>
                <div className="mb-24 text-center">
                  <Typography variant="h3" className="mb-4 text-2xl font-bold">
                    {currentDemo.title}
                  </Typography>
                  <Typography
                    variant="p"
                    affects="removePMargin"
                    className="text-muted-foreground mx-auto max-w-2xl text-lg"
                  >
                    {currentDemo.description}
                  </Typography>
                </div>
                <div className="grid items-start gap-12 lg:grid-cols-3">
                  <Card className="bg-card border-border">
                    <CardContent>
                      <div className="mb-6 flex items-center gap-4">
                        <div className="bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded-xl">
                          <Icon name="FileText" className="h-6 w-6" />
                        </div>
                        <div>
                          <Typography variant="h4" className="text-lg font-bold">
                            Input
                          </Typography>
                          <Typography
                            variant="p"
                            affects="removePMargin"
                            className="text-muted-foreground text-sm"
                          >
                            Your messy reality
                          </Typography>
                        </div>
                      </div>
                      <div className="bg-muted border-border space-y-3 rounded-xl border p-6">
                        <Typography
                          variant="p"
                          affects="removePMargin"
                          className="text-sm font-medium"
                        >
                          {currentDemo.input.title}
                        </Typography>
                        <Typography
                          variant="p"
                          affects="removePMargin"
                          className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line"
                        >
                          {currentDemo.input.content}
                        </Typography>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="flex flex-col items-center justify-center py-8">
                    <InView direction="up" delay={0.8}>
                      <div className="mb-6 hidden items-start justify-center lg:flex">
                        <div className="border-border bg-card text-card-foreground flex h-24 w-24 flex-col items-center justify-center rounded-full border">
                          <Icon name="ArrowRight" className="text-primary mb-1 h-6 w-6" />
                        </div>
                      </div>
                      <div className="text-center">
                        <Typography variant="h4" className="text-primary mb-2 text-lg font-bold">
                          Looma AI Processing
                        </Typography>
                        <Typography
                          variant="p"
                          affects="removePMargin"
                          className="text-muted-foreground text-sm"
                        >
                          {currentDemo.processing}
                        </Typography>
                        <div className="mt-6 flex justify-center gap-1">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="bg-primary h-2 w-2 animate-pulse rounded-full"
                              style={{ animationDelay: `${i * 0.3}s` }}
                            />
                          ))}
                        </div>
                      </div>
                    </InView>
                  </div>
                  <Card className="bg-primary/5 border-primary/30">
                    <CardContent>
                      <div className="mb-6 flex items-center gap-4">
                        <div className="bg-primary/20 text-primary flex h-12 w-12 items-center justify-center rounded-xl">
                          <Icon name="Sparkles" className="h-6 w-6" />
                        </div>
                        <div>
                          <Typography variant="h4" className="text-lg font-bold">
                            Output
                          </Typography>
                          <Typography
                            variant="p"
                            affects="removePMargin"
                            className="text-primary text-sm font-medium"
                          >
                            Perfectly organized
                          </Typography>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <Typography variant="h4" className="text-lg font-bold">
                          {currentDemo.output.title}
                        </Typography>
                        <div className="space-y-3">
                          {currentDemo.output.tasks.map((task, index) => (
                            <InView key={index} direction="left" delay={0.1 * index}>
                              <div className="bg-card border-border flex items-center gap-4 rounded-lg border p-4">
                                <Icon
                                  name="CheckCircle"
                                  className="text-primary h-5 w-5 flex-shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <Typography
                                    variant="p"
                                    affects="removePMargin"
                                    className="text-sm font-medium"
                                  >
                                    {task.task}
                                  </Typography>
                                  <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
                                    <Icon name="Clock" className="h-3 w-3" />
                                    <Typography affects="removePMargin">
                                      {task.date} • {task.assignee}
                                    </Typography>
                                  </div>
                                </div>
                                <div
                                  className={`rounded-full border px-3 py-1 text-xs font-medium ${getPriorityColor(task.priority)}`}
                                >
                                  {task.priority}
                                </div>
                              </div>
                            </InView>
                          ))}
                        </div>
                        <Separator />
                        {currentDemo.output.project && (
                          <div className="bg-card border-border rounded-lg border p-4">
                            <Typography variant="h5" className="mb-3 text-sm font-medium">
                              Project Context
                            </Typography>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div className="flex gap-1">
                                <Typography
                                  affects="removePMargin"
                                  className="text-muted-foreground"
                                >
                                  Budget
                                </Typography>
                                <Typography affects="removePMargin" className="font-medium">
                                  {currentDemo.output.project.budget}
                                </Typography>
                              </div>
                              <div className="flex gap-1">
                                <Typography
                                  affects="removePMargin"
                                  className="text-muted-foreground"
                                >
                                  Target
                                </Typography>
                                <Typography affects="removePMargin" className="font-medium">
                                  {currentDemo.output.project.target}
                                </Typography>
                              </div>
                            </div>
                          </div>
                        )}
                        {currentDemo.output.shopping && (
                          <div className="bg-card border-border rounded-lg border p-4">
                            <Typography variant="h5" className="mb-3 text-sm font-medium">
                              Shopping List Extracted
                            </Typography>
                            <Typography
                              affects="removePMargin"
                              className="text-muted-foreground text-xs"
                            >
                              {currentDemo.output.shopping.join(" • ")}
                            </Typography>
                          </div>
                        )}
                        {currentDemo.output.event && (
                          <div className="bg-card border-border rounded-lg border p-4">
                            <Typography variant="h5" className="mb-3 text-sm font-medium">
                              Event Detected
                            </Typography>
                            <div className="flex flex-col text-xs">
                              <Typography affects="removePMargin" className="font-medium">
                                {currentDemo.output.event.name} - {currentDemo.output.event.date}
                              </Typography>
                              <Typography
                                affects="removePMargin"
                                className="text-muted-foreground mt-1"
                              >
                                Related tasks: {currentDemo.output.event.tasks.join(", ")}
                              </Typography>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </InView>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}

export { InteractiveDemoSection }
