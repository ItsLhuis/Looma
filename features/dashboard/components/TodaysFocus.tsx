import { cn } from "@/lib/utils"

import { formatTimeForDisplay, toUTCDate } from "@/lib/date"

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
import type { TodaysFocus } from "../types"

type TodaysFocusProps = {
  data?: TodaysFocus
  isLoading?: boolean
}

export function TodaysFocus({ data, isLoading }: TodaysFocusProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="border-border border-b">
          <CardTitle className="flex items-center justify-between">
            <Typography variant="h5">Today&apos;s Focus</Typography>
            <Skeleton className="h-6 w-16" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-card flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-card flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <Skeleton className="mb-2 h-4 w-40" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-12" />
                      <Skeleton className="h-5 w-14" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const formatTime = (date: Date | string | number) => {
    const dateObj = toUTCDate(date.toString())

    if (isNaN(dateObj.getTime())) {
      return "Invalid time"
    }

    return formatTimeForDisplay(dateObj)
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
          <Typography variant="h5">Today&apos;s Focus</Typography>
          <Badge variant="outline">{data.stats.eventsCount + data.stats.tasksCount} items</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <Typography variant="h6" affects="muted">
              Events ({data.stats.eventsCount})
            </Typography>
            <Button variant="outline" size="sm" asChild>
              <Link href="/calendar">View All</Link>
            </Button>
          </div>
          {data.events.length > 0 ? (
            <div className="space-y-2">
              {data.events.map((event) => (
                <div
                  key={event.id}
                  className="bg-card lex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Typography affects={["bold", "small"]} className="truncate">
                      {event.title}
                    </Typography>
                    <Typography affects={["small", "muted"]}>
                      {event.isAllDay
                        ? "All day"
                        : `${formatTime(event.startTime)}${event.endTime ? ` - ${formatTime(event.endTime)}` : ""}`}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Typography affects={["small", "muted"]} className="py-4 text-center">
              No events scheduled for today
            </Typography>
          )}
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Typography variant="h6" affects="muted">
                Tasks ({data.stats.tasksCount})
              </Typography>
              {data.stats.overdueCount > 0 && (
                <Badge className="bg-error text-error-foreground border-error border">
                  {data.stats.overdueCount} overdue
                </Badge>
              )}
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/tasks">View All</Link>
            </Button>
          </div>
          {data.tasks.length > 0 ? (
            <div className="space-y-2">
              {data.tasks.map((task) => (
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
                      {task.isOverdue && (
                        <Badge className="bg-error text-error-foreground border-error border text-xs">
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Typography affects={["small", "muted"]} className="py-4 text-center">
              No tasks due today
            </Typography>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
