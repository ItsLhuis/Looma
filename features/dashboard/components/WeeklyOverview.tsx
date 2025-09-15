import { cn } from "@/lib/utils"

import Link from "next/link"

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Typography
} from "@/components/ui"

import type { TaskStatus } from "@/features/tasks/types"
import type { WeeklyOverview } from "../types"

type WeeklyOverviewProps = {
  data?: WeeklyOverview
  isLoading?: boolean
}

function WeeklyOverview({ data, isLoading }: WeeklyOverviewProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="border-border border-b">
          <CardTitle>
            <Typography variant="h5">This Week</Typography>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <div className="space-y-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <div className="space-y-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const formatTime = (date: Date | string | number) => {
    const dateObj = new Date(date)

    if (isNaN(dateObj.getTime())) {
      return "Invalid time"
    }

    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }).format(dateObj)
  }

  const getPriorityClasses = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-error text-error-foreground border border-error"
      case "high":
        return "bg-warning text-warning-foreground border border-warning"
      case "medium":
        return "bg-info text-info-foreground border border-info"
      case "low":
        return "bg-success text-success-foreground border border-success"
      default:
        return "bg-muted text-muted-foreground border border-muted"
    }
  }

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success text-success-foreground border border-success"
      case "inProgress":
        return "bg-info text-info-foreground border border-info"
      case "onHold":
        return "bg-warning text-warning-foreground border border-warning"
      case "cancelled":
        return "bg-error text-error-foreground border border-error"
      default:
        return "bg-muted text-muted-foreground border border-muted"
    }
  }

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case "pending":
        return "Pending"
      case "inProgress":
        return "In Progress"
      case "completed":
        return "Completed"
      case "cancelled":
        return "Cancelled"
      case "onHold":
        return "On Hold"
      default:
        return status
    }
  }

  return (
    <Card>
      <CardHeader className="border-border border-b">
        <CardTitle className="flex items-center justify-between">
          <Typography variant="h5">This Week</Typography>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                data.completionProgress.percentage === 100
                  ? "bg-success text-success-foreground border-success border"
                  : data.completionProgress.percentage < 50 &&
                      data.completionProgress.percentage > 25
                    ? "bg-warning text-warning-foreground border-warning border"
                    : data.completionProgress.percentage < 25
                      ? "bg-error text-error-foreground border-error border"
                      : "bg-info text-info-foreground border-info border"
              )}
            >
              {data.completionProgress.percentage}% complete
            </Badge>
            <Button variant="outline" size="sm" asChild>
              <Link href="/calendar">View Calendar</Link>
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Typography affects={["small", "muted"]}>Weekly Progress</Typography>
            <Typography affects={["small"]}>
              {data.completionProgress.completed} of {data.completionProgress.total} completed
            </Typography>
          </div>
          <div className="bg-secondary h-2 w-full rounded-full">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${data.completionProgress.percentage}%` }}
            />
          </div>
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between">
            <Typography variant="h6" affects="muted">
              Upcoming Events ({data.events.length})
            </Typography>
            <Button variant="outline" size="sm" asChild>
              <Link href="/calendar">View All</Link>
            </Button>
          </div>
          {data.events.length > 0 ? (
            <div className="space-y-2">
              {data.events.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="bg-card flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <Typography affects={["bold", "small"]} className="truncate">
                      {event.title}
                    </Typography>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {event.dayOfWeek}
                      </Badge>
                      <Typography affects={["small", "muted"]}>
                        {event.isAllDay ? "All day" : formatTime(event.startTime)}
                      </Typography>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Typography affects="small" className="text-muted-foreground py-4 text-center">
              No events this week
            </Typography>
          )}
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between">
            <Typography variant="h6" affects="muted">
              Tasks Due This Week ({data.tasks.length})
            </Typography>
            <Button variant="outline" size="sm" asChild>
              <Link href="/tasks">View All</Link>
            </Button>
          </div>
          {data.tasks.length > 0 ? (
            <div className="space-y-2">
              {data.tasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="bg-card flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <Typography affects={["bold", "small"]} className="truncate">
                      {task.title}
                    </Typography>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge className={getStatusClasses(task.status)}>
                        {getStatusLabel(task.status as TaskStatus)}
                      </Badge>
                      <Badge className={cn(getPriorityClasses(task.priority), "capitalize")}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {task.dayOfWeek}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Typography affects={["small", "muted"]} className="py-4 text-center">
              No tasks due this week
            </Typography>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export { WeeklyOverview }
