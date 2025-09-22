"use client"

import { cn } from "@/lib/utils"

import { formatDateForDisplay } from "@/lib/date"

import { Badge, Card, CardContent, CardHeader, Icon, Separator, Typography } from "@/components/ui"

import {
  getPriorityClasses,
  getStatusClasses,
  getStatusLabel,
  getActionStatusClasses,
  getActionStatusIcon,
  getActionStatusColor
} from "@/features/tasks/utils/status.utils"

import type { DeleteTaskToolInput } from "../schemas/task.schema"

type TaskDeleteCancelledConfirmationProps = {
  taskData: DeleteTaskToolInput
}

function TaskDeleteCancelledConfirmation({ taskData }: TaskDeleteCancelledConfirmationProps) {
  const formatDueDate = (dueDate?: string) => {
    if (!dueDate) return null
    try {
      return formatDateForDisplay(new Date(dueDate))
    } catch {
      return dueDate
    }
  }

  const formatDuration = (duration?: number) => {
    if (!duration) return null
    if (duration < 60) return `${duration}m`
    const hours = Math.floor(duration / 60)
    const minutes = duration % 60
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }

  return (
    <Card
      className={cn("flex flex-col", getActionStatusClasses("cancelled"))}
      aria-label={`Task Deletion Cancelled: ${taskData.title}`}
    >
      <CardHeader className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Icon
              name={getActionStatusIcon("cancelled")}
              className={cn("h-5 w-5", getActionStatusColor("cancelled"))}
            />
            <Typography variant="h5" className="line-clamp-2 leading-tight">
              Task Deletion Cancelled
            </Typography>
          </div>
          <Typography affects={["muted", "small"]}>Task deletion was cancelled by user</Typography>
        </div>
        <div className="flex max-w-full shrink-0 flex-col flex-wrap items-end gap-1.5 overflow-hidden">
          {taskData.status && (
            <Badge className={cn(getStatusClasses(taskData.status), "shrink-0")}>
              {getStatusLabel(taskData.status)}
            </Badge>
          )}
          {taskData.priority && taskData.priority !== "none" && (
            <Badge className={cn(getPriorityClasses(taskData.priority), "shrink-0 capitalize")}>
              {taskData.priority}
            </Badge>
          )}
          {taskData.parentTaskId && (
            <Badge variant="outline" className="shrink-0">
              <Icon name="Info" className="mr-1 h-3 w-3" />
              Subtask
            </Badge>
          )}
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex h-full flex-col gap-6 wrap-break-word">
        <Typography variant="h6" className="line-clamp-2 leading-tight">
          {taskData.title}
        </Typography>
        {taskData.description ? (
          <Typography affects={["muted", "small"]} className="line-clamp-4">
            {taskData.description.trim()}
          </Typography>
        ) : (
          <Typography className="italic" affects={["muted", "small"]}>
            No description
          </Typography>
        )}
        {taskData.estimatedDuration && (
          <div className="flex items-center gap-2">
            <Icon name="Clock" className="text-muted-foreground h-4 w-4" />
            <Typography affects={["muted", "small"]}>
              {formatDuration(taskData.estimatedDuration)} minutes
            </Typography>
          </div>
        )}
        {taskData.dueDate && (
          <div className="flex items-center gap-2">
            <Icon name="Calendar" className="text-muted-foreground h-4 w-4" />
            <Typography affects={["muted", "small"]}>
              Due: {formatDueDate(taskData.dueDate)}
            </Typography>
          </div>
        )}
        <div className="bg-error/10 border-error/20 rounded-md border p-3">
          <Typography affects={["muted", "small"]} className="text-center">
            This task was not deleted. You can ask me to delete it again if needed.
          </Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export { TaskDeleteCancelledConfirmation }
