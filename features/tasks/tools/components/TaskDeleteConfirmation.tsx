"use client"

import { cn } from "@/lib/utils"

import { useDeleteTask } from "@/features/tasks/api/mutations"

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

import type { DeleteTaskToolInput } from "../schemas/task.schema"

type TaskDeleteConfirmationProps = {
  toolCallId: string
  input: DeleteTaskToolInput
  onApprove: (toolCallId: string, output: string) => void
  onReject: (toolCallId: string, output: string) => void
}

function TaskDeleteConfirmation({
  toolCallId,
  input,
  onApprove,
  onReject
}: TaskDeleteConfirmationProps) {
  const deleteTaskMutation = useDeleteTask(input.id)

  const handleApprove = async () => {
    try {
      await deleteTaskMutation.mutateAsync()

      const result = {
        type: "TASK_DELETED",
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
        message: `Task "${input.title}" has been successfully deleted!`
      }

      onApprove(toolCallId, JSON.stringify(result))
    } catch (error) {
      const errorResult = {
        type: "ERROR",
        message: `Failed to delete task: ${error instanceof Error ? error.message : "Unknown error"}`
      }
      onApprove(toolCallId, JSON.stringify(errorResult))
    }
  }

  const handleReject = async () => {
    const result = {
      type: "TASK_DELETE_CANCELLED",
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
      message: "Task deletion was cancelled by user."
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
    <Card aria-label={`Delete Task: ${input.title}`}>
      <CardHeader className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Icon name="Trash" className="h-5 w-5" />
            <Typography variant="h5" className="line-clamp-2 leading-tight">
              Delete Task
            </Typography>
          </div>
          <Typography affects={["muted", "small"]}>This action cannot be undone</Typography>
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
        <div className="bg-destructive/10 border-destructive/20 rounded-md border p-3">
          <Typography affects={["muted", "small"]} className="text-center">
            Are you sure you want to delete this task? This action cannot be undone.
          </Typography>
        </div>
      </CardContent>
      <CardFooter className="flex items-end justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleReject}
          disabled={deleteTaskMutation.isPending}
          isLoading={deleteTaskMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={handleApprove}
          disabled={deleteTaskMutation.isPending}
          isLoading={deleteTaskMutation.isPending}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}

export { TaskDeleteConfirmation }
