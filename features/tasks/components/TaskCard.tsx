"use client"

import Link from "next/link"

import { cn } from "@/lib/utils"

import { formatDateForDisplay, toUTCDate } from "@/lib/date"

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

import {
  getPriorityClasses,
  getStatusClasses,
  getStatusLabel
} from "@/features/tasks/utils/status.utils"

import type { Task } from "@/features/tasks/types"

const isOverdue = (dueDate: Date | null) => {
  if (!dueDate) return false
  const now = new Date()
  return now > dueDate
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
  const dueDate = task.dueDate ? toUTCDate(task.dueDate.toString()) : null
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
            Updated at {formatDateForDisplay(toUTCDate(task.updatedAt.toString()))}
          </Typography>
        </div>
        <div className="flex max-w-full shrink-0 flex-col flex-wrap items-end gap-1.5 overflow-hidden">
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
              {formatDateForDisplay(dueDate)}
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
              Completed at {formatDateForDisplay(toUTCDate(task.completedAt.toString()))}
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
