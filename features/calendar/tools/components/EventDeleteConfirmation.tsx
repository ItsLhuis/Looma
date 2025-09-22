"use client"

import { useDeleteEvent } from "@/features/calendar/api/mutations"

import { formatDateForDisplay, formatTimeForDisplay } from "@/lib/date"

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

import type { EventDeleteConfirmationData } from "../types/event.types"

type EventDeleteConfirmationProps = {
  toolCallId: string
  input: EventDeleteConfirmationData
  onApprove: (toolCallId: string, output: string) => void
  onReject: (toolCallId: string, output: string) => void
}

function EventDeleteConfirmation({
  toolCallId,
  input,
  onApprove,
  onReject
}: EventDeleteConfirmationProps) {
  const deleteEventMutation = useDeleteEvent(input.id)

  const handleApprove = async () => {
    try {
      await deleteEventMutation.mutateAsync()

      const result = {
        type: "EVENT_DELETED",
        data: {
          id: input.id,
          title: input.title,
          startTime: input.startTime,
          endTime: input.endTime,
          isAllDay: input.isAllDay
        },
        message: `Event "${input.title}" has been successfully deleted!`
      }

      onApprove(toolCallId, JSON.stringify(result))
    } catch (error) {
      const errorResult = {
        type: "ERROR",
        message: `Failed to delete event: ${error instanceof Error ? error.message : "Unknown error"}`
      }
      onApprove(toolCallId, JSON.stringify(errorResult))
    }
  }

  const handleReject = async () => {
    const result = {
      type: "EVENT_CANCELLED",
      data: {
        id: input.id,
        title: input.title,
        startTime: input.startTime,
        endTime: input.endTime,
        isAllDay: input.isAllDay
      },
      message: "Event deletion was cancelled by user."
    }

    onReject(toolCallId, JSON.stringify(result))
  }

  const formatEventTime = (startTime: string, endTime?: string, isAllDay?: boolean) => {
    try {
      const start = new Date(startTime)
      const end = endTime ? new Date(endTime) : null

      if (isAllDay) {
        return formatDateForDisplay(start)
      }

      if (end) {
        const startFormatted = formatTimeForDisplay(start)
        const endFormatted = formatTimeForDisplay(end)
        return `${formatDateForDisplay(start)} at ${startFormatted} - ${endFormatted}`
      }

      return `${formatDateForDisplay(start)} at ${formatTimeForDisplay(start)}`
    } catch {
      return startTime
    }
  }

  return (
    <Card aria-label={`Delete Event: ${input.title}`} className="border-destructive">
      <CardHeader className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Icon name="Trash2" className="text-destructive h-5 w-5" />
            <Typography variant="h5" className="text-destructive line-clamp-2 leading-tight">
              Delete Event
            </Typography>
          </div>
          <Typography affects={["muted", "small"]}>This action cannot be undone</Typography>
        </div>
        <div className="flex max-w-full shrink-0 flex-col flex-wrap items-end gap-1.5 overflow-hidden">
          {input.isAllDay && (
            <Badge variant="outline" className="shrink-0">
              <Icon name="Calendar" className="mr-1 h-3 w-3" />
              All Day
            </Badge>
          )}
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex h-full flex-col gap-6 wrap-break-word">
        <Typography variant="h6" className="line-clamp-2 leading-tight">
          {input.title}
        </Typography>
        <div className="flex items-center gap-2">
          <Icon name="Clock" className="text-muted-foreground h-4 w-4" />
          <Typography affects={["muted", "small"]}>
            {formatEventTime(input.startTime, input.endTime, input.isAllDay)}
          </Typography>
        </div>
        <div className="bg-destructive/10 rounded-md p-3">
          <Typography affects={["small"]} className="text-destructive">
            <Icon name="AlertTriangle" className="mr-1 inline h-4 w-4" />
            This event will be permanently deleted and cannot be recovered.
          </Typography>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleReject}
          disabled={deleteEventMutation.isPending}
          isLoading={deleteEventMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={handleApprove}
          disabled={deleteEventMutation.isPending}
          isLoading={deleteEventMutation.isPending}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}

export { EventDeleteConfirmation }
