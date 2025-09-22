"use client"

import { cn } from "@/lib/utils"

import { formatDateForDisplay } from "@/lib/date"

import { Badge, Card, CardContent, CardHeader, Icon, Separator, Typography } from "@/components/ui"

import {
  getActionStatusClasses,
  getActionStatusColor,
  getActionStatusIcon,
  getPriorityClasses,
  getStatusClasses,
  getStatusLabel
} from "@/features/tasks/utils/status.utils"

import type { UpdateTaskToolInput } from "../schemas/task.schema"

type TaskUpdatedConfirmationProps = {
  taskData: UpdateTaskToolInput & { id: string }
}

function TaskUpdatedConfirmation({ taskData }: TaskUpdatedConfirmationProps) {
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
      className={cn("flex flex-col", getActionStatusClasses("success"))}
      aria-label={`Task Updated: ${taskData.title || taskData.id}`}
    >
      <CardHeader className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Icon
              name={getActionStatusIcon("success")}
              className={cn("h-5 w-5", getActionStatusColor("success"))}
            />
            <Typography variant="h5" className="line-clamp-2 leading-tight">
              Task Updated Successfully
            </Typography>
          </div>
          <Typography affects={["muted", "small"]}>Task has been successfully updated</Typography>
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
      <Separator className="bg-success/20" />
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
      </CardContent>
    </Card>
  )
}

export { TaskUpdatedConfirmation }
