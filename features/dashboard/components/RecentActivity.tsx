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
import type { RecentActivity } from "../types"

type RecentActivityProps = {
  data?: RecentActivity
  isLoading?: boolean
}

function RecentActivity({ data, isLoading }: RecentActivityProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="border-border border-b">
          <CardTitle>
            <Typography variant="h5">Recent Activity</Typography>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-card flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <Skeleton className="mb-2 h-4 w-40" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-12" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-3 flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-card flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <Skeleton className="mb-2 h-4 w-40" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-3 flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-card flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <Skeleton className="mb-2 h-4 w-40" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
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

  const formatRelativeTime = (date: Date | string | number) => {
    const now = new Date()
    const dateObj = new Date(date)

    if (isNaN(dateObj.getTime())) {
      return "Unknown time"
    }

    const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`

    return dateObj.toLocaleDateString()
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
        <CardTitle>
          <Typography variant="h5">Recent Activity</Typography>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <Typography variant="h6" affects="muted">
              Recent Notes ({data.notes.length})
            </Typography>
            <Button variant="outline" size="sm" asChild>
              <Link href="/notes">View All</Link>
            </Button>
          </div>
          {data.notes.length > 0 ? (
            <div className="space-y-2">
              {data.notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-card flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <Typography affects={["bold", "small"]} className="truncate">
                      {note.title}
                    </Typography>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge className={cn(getPriorityClasses(note.priority), "capitalize")}>
                        {note.priority}
                      </Badge>
                      <Typography affects={["muted", "small"]} className="truncate">
                        {formatRelativeTime(note.updatedAt)}
                      </Typography>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Typography affects="small" className="text-muted-foreground py-4 text-center">
              No recent notes
            </Typography>
          )}
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between">
            <Typography variant="h6" affects="muted">
              Recent Tasks ({data.tasks.length})
            </Typography>
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
                      <Typography affects={["muted", "small"]} className="truncate">
                        {formatRelativeTime(task.updatedAt)}
                      </Typography>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Typography affects={["small", "muted"]} className="py-4 text-center">
              No recent tasks
            </Typography>
          )}
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between">
            <Typography variant="h6" affects="muted">
              Recent Events ({data.events.length})
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
                  className="bg-card flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <Typography affects={["bold", "small"]} className="truncate">
                      {event.title}
                    </Typography>
                    <div className="mt-1 flex items-center gap-2">
                      <Typography affects={["muted", "small"]} className="truncate">
                        {new Date(event.startTime).toLocaleDateString()}
                      </Typography>
                      <Typography affects={["muted", "small"]}>
                        {formatRelativeTime(event.updatedAt)}
                      </Typography>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Typography affects={["small", "muted"]} className="py-4 text-center">
              No recent events
            </Typography>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export { RecentActivity }
