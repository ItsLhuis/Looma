"use client"

import { cn } from "@/lib/utils"

import { useCreateTask } from "@/features/tasks/api/mutations"

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

import type { CreateTaskToolInput } from "../schemas/task.schema"

type TaskCreationConfirmationProps = {
  toolCallId: string
  input: CreateTaskToolInput
  onApprove: (toolCallId: string, output: string) => void
  onReject: (toolCallId: string, output: string) => void
}

function TaskCreationConfirmation({
  toolCallId,
  input,
  onApprove,
  onReject
}: TaskCreationConfirmationProps) {
  const createTaskMutation = useCreateTask()

  const handleApprove = async () => {
    try {
      const createdTask = await createTaskMutation.mutateAsync({
        title: input.title,
        description: input.description,
        status: input.status,
        priority: input.priority,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        estimatedDuration: input.estimatedDuration,
        parentTaskId: input.parentTaskId
      })

      const result = {
        type: "TASK_CREATED",
        data: {
          id: createdTask.data.id,
          title: createdTask.data.title,
          description: createdTask.data.description,
          status: createdTask.data.status,
          priority: createdTask.data.priority,
          dueDate: createdTask.data.dueDate,
          estimatedDuration: createdTask.data.estimatedDuration,
          parentTaskId: createdTask.data.parentTaskId
        },
        message: `Task "${createdTask.data.title}" has been successfully created!`
      }

      onApprove(toolCallId, JSON.stringify(result))
    } catch (error) {
      const errorResult = {
        type: "ERROR",
        message: `Failed to create task: ${error instanceof Error ? error.message : "Unknown error"}`
      }
      onApprove(toolCallId, JSON.stringify(errorResult))
    }
  }

  const handleReject = async () => {
    const result = {
      type: "TASK_CREATION_CANCELLED",
      data: {
        title: input.title,
        description: input.description,
        status: input.status,
        priority: input.priority,
        dueDate: input.dueDate,
        estimatedDuration: input.estimatedDuration,
        parentTaskId: input.parentTaskId
      },
      message: "Task creation was cancelled by user."
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
    <Card aria-label={`Create Task: ${input.title}`}>
      <CardHeader className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Icon name="Plus" className="h-5 w-5" />
            <Typography variant="h5" className="line-clamp-2 leading-tight">
              Create Task
            </Typography>
          </div>
          <Typography affects={["muted", "small"]}>Review the details before creating</Typography>
        </div>
        <div className="flex max-w-full shrink-0 flex-col flex-wrap items-end gap-1.5 overflow-hidden">
          <Badge className={cn(getStatusClasses(input.status), "shrink-0")}>
            {getStatusLabel(input.status)}
          </Badge>
          {input.priority !== "none" && (
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
          disabled={createTaskMutation.isPending}
          isLoading={createTaskMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleApprove}
          disabled={createTaskMutation.isPending}
          isLoading={createTaskMutation.isPending}
        >
          Create
        </Button>
      </CardFooter>
    </Card>
  )
}

export { TaskCreationConfirmation }
