"use client"

import { cn } from "@/lib/utils"

import { useUpdateTask } from "@/features/tasks/api/mutations"

import { formatDateForDisplay } from "@/lib/date"

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

import {
  getPriorityClasses,
  getStatusClasses,
  getStatusLabel
} from "@/features/tasks/utils/status.utils"

import type { UpdateTaskToolInput } from "../schemas/task.schema"

type TaskUpdateConfirmationProps = {
  toolCallId: string
  input: UpdateTaskToolInput
  onApprove: (toolCallId: string, output: string) => void
  onReject: (toolCallId: string, output: string) => void
}

function TaskUpdateConfirmation({
  toolCallId,
  input,
  onApprove,
  onReject
}: TaskUpdateConfirmationProps) {
  const updateTaskMutation = useUpdateTask(input.id)

  const handleApprove = async () => {
    try {
      const updatedTask = await updateTaskMutation.mutateAsync({
        title: input.title,
        description: input.description,
        status: input.status,
        priority: input.priority,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        estimatedDuration: input.estimatedDuration,
        parentTaskId: input.parentTaskId
      })

      const result = {
        type: "TASK_UPDATED",
        data: {
          id: updatedTask.data.id,
          title: updatedTask.data.title,
          description: updatedTask.data.description,
          status: updatedTask.data.status,
          priority: updatedTask.data.priority,
          dueDate: updatedTask.data.dueDate,
          estimatedDuration: updatedTask.data.estimatedDuration,
          parentTaskId: updatedTask.data.parentTaskId
        },
        message: `Task "${updatedTask.data.title}" has been successfully updated!`
      }

      onApprove(toolCallId, JSON.stringify(result))
    } catch (error) {
      const errorResult = {
        type: "ERROR",
        message: `Failed to update task: ${error instanceof Error ? error.message : "Unknown error"}`
      }
      onApprove(toolCallId, JSON.stringify(errorResult))
    }
  }

  const handleReject = async () => {
    const result = {
      type: "TASK_UPDATE_CANCELLED",
      data: {
        id: input.id,
        title: input.title,
        description: input.description,
        status: input.status,
        priority: input.priority,
        dueDate: input.dueDate,
        estimatedDuration: input.estimatedDuration,
        parentTaskId: input.parentTaskId
      },
      message: "Task update was cancelled by user."
    }

    onReject(toolCallId, JSON.stringify(result))
  }

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
    <Card aria-label={`Update Task: ${input.title}`}>
      <CardHeader className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Icon name="Pencil" className="h-5 w-5" />
            <Typography variant="h5" className="line-clamp-2 leading-tight">
              Update Task
            </Typography>
          </div>
          <Typography affects={["muted", "small"]}>Review the changes before updating</Typography>
        </div>
        <div className="flex max-w-full shrink-0 flex-col flex-wrap items-end gap-1.5 overflow-hidden">
          {input.status && (
            <Badge className={cn(getStatusClasses(input.status), "shrink-0")}>
              {getStatusLabel(input.status)}
            </Badge>
          )}
          {input.priority && input.priority !== "none" && (
            <Badge className={cn(getPriorityClasses(input.priority), "shrink-0 capitalize")}>
              {input.priority}
            </Badge>
          )}
          {input.parentTaskId && (
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
          {input.title}
        </Typography>
        {input.description && (
          <Typography affects={["muted", "small"]} className="line-clamp-4">
            {input.description.trim()}
          </Typography>
        )}
        {input.estimatedDuration && (
          <div className="flex items-center gap-2">
            <Icon name="Clock" className="text-muted-foreground h-4 w-4" />
            <Typography affects={["muted", "small"]}>
              {formatDuration(input.estimatedDuration)} minutes
            </Typography>
          </div>
        )}
        {input.dueDate && (
          <div className="flex items-center gap-2">
            <Icon name="Calendar" className="text-muted-foreground h-4 w-4" />
            <Typography affects={["muted", "small"]}>
              Due: {formatDueDate(input.dueDate)}
            </Typography>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-end justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleReject}
          disabled={updateTaskMutation.isPending}
          isLoading={updateTaskMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleApprove}
          disabled={updateTaskMutation.isPending}
          isLoading={updateTaskMutation.isPending}
        >
          Update
        </Button>
      </CardFooter>
    </Card>
  )
}

export { TaskUpdateConfirmation }
