"use client"

import Link from "next/link"

import { cn } from "@/lib/utils"

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Icon,
  Separator,
  Typography
} from "@/components/ui"
import { DeleteTaskDialog } from "./DeleteTaskDialog"

import type { Task, TaskPriority, TaskStatus } from "@/features/tasks/types"

const getPriorityClasses = (priority: TaskPriority) => {
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

const getStatusClasses = (status: TaskStatus) => {
  switch (status) {
    case "completed":
      return "bg-success text-success-foreground border border-success"
    case "inProgress":
      return "bg-info text-info-foreground border border-info"
    case "onHold":
      return "bg-warning text-warning-foreground border border-warning"
    case "cancelled":
      return "bg-destructive text-destructive-foreground border border-destructive"
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

const isOverdue = (dueDate: Date | null) => {
  if (!dueDate) return false
  return new Date() > dueDate
}

const isDueSoon = (dueDate: Date | null) => {
  if (!dueDate) return false
  const today = new Date()
  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 7 && diffDays >= 0
}

export type TaskCardProps = {
  task: Task
  className?: string
}

function TaskCard({ task, className }: TaskCardProps) {
  const dueDate = task.dueDate ? new Date(task.dueDate) : null
  const isOverdueTask = isOverdue(dueDate)
  const isDueSoonTask = isDueSoon(dueDate)

  return (
    <Card className={cn("flex flex-col", className)} aria-label={`Task ${task.title}`}>
      <CardHeader className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <Typography variant="h5" className="line-clamp-2 leading-tight">
            {task.title}
          </Typography>
          <Typography affects={["muted", "small"]}>
            Updated at {new Date(task.updatedAt).toLocaleString()}
          </Typography>
        </div>
        <div className="flex max-w-full flex-col flex-wrap items-end gap-1.5 overflow-hidden">
          <Badge className={cn(getStatusClasses(task.status), "shrink-0")}>
            {getStatusLabel(task.status)}
          </Badge>
          {task.priority !== "none" && (
            <Badge className={cn(getPriorityClasses(task.priority), "shrink-0 capitalize")}>
              {task.priority}
            </Badge>
          )}
          {dueDate && (
            <Badge
              className={cn(
                "shrink-0",
                isOverdueTask
                  ? "bg-destructive text-destructive-foreground border-destructive border"
                  : isDueSoonTask
                    ? "bg-warning text-warning-foreground border-warning border"
                    : "bg-muted text-muted-foreground border-muted border"
              )}
            >
              <Icon name="Calendar" className="mr-1 h-3 w-3" />
              {dueDate.toLocaleDateString()}
            </Badge>
          )}
          {task.parentTaskId && (
            <Badge variant="outline" className="shrink-0">
              <Icon name="Info" className="mr-1 h-3 w-3" />
              Subtask
            </Badge>
          )}
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex h-full flex-col gap-6 wrap-break-word">
        {task.description ? (
          <Typography affects={["muted", "small"]} className="line-clamp-4">
            {task.description.trim()}
          </Typography>
        ) : (
          <Typography className="italic" affects={["muted", "small"]}>
            No description
          </Typography>
        )}
        {task.estimatedDuration && (
          <div className="flex items-center gap-2">
            <Icon name="Clock" className="text-muted-foreground h-4 w-4" />
            <Typography affects={["muted", "small"]}>{task.estimatedDuration} minutes</Typography>
          </div>
        )}
        {task.completedAt && (
          <div className="flex items-center gap-2">
            <Icon name="CheckCircle" className="text-success h-4 w-4" />
            <Typography affects={["muted", "small"]}>
              Completed at {new Date(task.completedAt).toLocaleString()}
            </Typography>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-end justify-end gap-2">
        <Button size="sm" variant="outline" asChild aria-label="Edit task">
          <Link href={`/tasks/${task.id}`}>Edit</Link>
        </Button>
        <DeleteTaskDialog
          taskId={task.id}
          trigger={
            <Button size="sm" variant="destructive" aria-label="Delete task">
              Delete
            </Button>
          }
        />
      </CardFooter>
    </Card>
  )
}

export { TaskCard }
