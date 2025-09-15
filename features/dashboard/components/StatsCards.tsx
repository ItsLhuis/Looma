import { cn } from "@/lib/utils"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Icon,
  Skeleton,
  Typography
} from "@/components/ui"

import type { DashboardStats } from "../types"

type StatsCardsProps = {
  stats?: DashboardStats
  isLoading?: boolean
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="mt-2 h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const statItems = [
    {
      title: "Total Tasks",
      value: stats.totalTasks,
      description: `${stats.completedTasks} completed`,
      icon: <Icon name="CheckSquare" />,
      color: "text-info"
    },
    {
      title: "Completion Rate",
      value: `${stats.completionRate}%`,
      description: `${stats.completedTasks} of ${stats.totalTasks}`,
      icon: <Icon name="Check" />,
      color: "text-info"
    },
    {
      title: "Today's Events",
      value: stats.todayEvents,
      description: `${stats.thisWeekEvents} this week`,
      icon: <Icon name="Calendar" />,
      color: "text-info"
    },
    {
      title: "Notes",
      value: stats.totalNotes,
      description: "Total notes",
      icon: <Icon name="Notebook" />,
      color: "text-info"
    }
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>
              <Typography affects="muted">{item.title}</Typography>
            </CardTitle>
            <span className="text-lg" aria-label={item.title}>
              {item.icon}
            </span>
          </CardHeader>
          <CardContent>
            <Typography variant="h3" className={cn(item.color)}>
              {item.value}
            </Typography>
            <Typography affects="muted" className="mt-1">
              {item.description}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
