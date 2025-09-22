"use client"

import { useUpdateEvent } from "@/features/calendar/api/mutations"

import { formatEventTimeRange } from "@/lib/date"

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

import type { UpdateEventToolInput } from "../schemas/event.schema"

type EventUpdateConfirmationProps = {
  toolCallId: string
  input: UpdateEventToolInput
  onApprove: (toolCallId: string, output: string) => void
  onReject: (toolCallId: string, output: string) => void
}

function EventUpdateConfirmation({
  toolCallId,
  input,
  onApprove,
  onReject
}: EventUpdateConfirmationProps) {
  const updateEventMutation = useUpdateEvent(input.id!)

  const handleApprove = async () => {
    try {
      const updatedEvent = await updateEventMutation.mutateAsync({
        title: input.title,
        description: input.description,
        startTime: input.startTime ? new Date(input.startTime) : undefined,
        endTime: input.endTime ? new Date(input.endTime) : undefined,
        isAllDay: input.isAllDay
      })

      const result = {
        type: "EVENT_UPDATED",
        data: {
          id: updatedEvent.data.id,
          title: updatedEvent.data.title,
          description: updatedEvent.data.description,
          startTime: updatedEvent.data.startTime,
          endTime: updatedEvent.data.endTime,
          isAllDay: updatedEvent.data.isAllDay
        },
        message: `Event "${updatedEvent.data.title}" has been successfully updated!`
      }

      onApprove(toolCallId, JSON.stringify(result))
    } catch (error) {
      const errorResult = {
        type: "ERROR",
        message: `Failed to update event: ${error instanceof Error ? error.message : "Unknown error"}`
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
        description: input.description,
        startTime: input.startTime,
        endTime: input.endTime,
        isAllDay: input.isAllDay
      },
      message: "Event update was cancelled by user."
    }

    onReject(toolCallId, JSON.stringify(result))
  }

  const formatEventTime = (startTime?: string, endTime?: string, isAllDay?: boolean) => {
    if (!startTime) return "No time specified"

    try {
      const start = new Date(startTime)
      const end = endTime ? new Date(endTime) : null
      return formatEventTimeRange(start, end, isAllDay)
    } catch {
      return startTime
    }
  }

  return (
    <Card aria-label={`Update Event: ${input.title || "Untitled"}`}>
      <CardHeader className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Icon name="Edit" className="h-5 w-5" />
            <Typography variant="h5" className="line-clamp-2 leading-tight">
              Update Event
            </Typography>
          </div>
          <Typography affects={["muted", "small"]}>Review the changes before updating</Typography>
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
          {input.title || "Untitled Event"}
        </Typography>
        {input.description && (
          <Typography affects={["muted", "small"]} className="line-clamp-4">
            {input.description.trim()}
          </Typography>
        )}
        {input.startTime && (
          <div className="flex items-center gap-2">
            <Icon name="Clock" className="text-muted-foreground h-4 w-4" />
            <Typography affects={["muted", "small"]}>
              {formatEventTime(input.startTime, input.endTime, input.isAllDay)}
            </Typography>
          </div>
        )}
      </CardContent>
      <Separator />
      <CardFooter className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleReject}
          disabled={updateEventMutation.isPending}
          isLoading={updateEventMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleApprove}
          disabled={updateEventMutation.isPending}
          isLoading={updateEventMutation.isPending}
        >
          Update
        </Button>
      </CardFooter>
    </Card>
  )
}

export { EventUpdateConfirmation }
