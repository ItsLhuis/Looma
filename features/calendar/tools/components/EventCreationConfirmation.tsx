"use client"

import { useCreateEvent } from "@/features/calendar/api/mutations"

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

import type { CreateEventToolInput } from "../schemas/event.schema"

type EventCreationConfirmationProps = {
  toolCallId: string
  input: CreateEventToolInput
  onApprove: (toolCallId: string, output: string) => void
  onReject: (toolCallId: string, output: string) => void
}

function EventCreationConfirmation({
  toolCallId,
  input,
  onApprove,
  onReject
}: EventCreationConfirmationProps) {
  const createEventMutation = useCreateEvent()

  const handleApprove = async () => {
    try {
      const createdEvent = await createEventMutation.mutateAsync({
        title: input.title,
        description: input.description,
        startTime: new Date(input.startTime),
        endTime: input.endTime ? new Date(input.endTime) : undefined,
        isAllDay: input.isAllDay
      })

      const result = {
        type: "EVENT_CREATED",
        data: {
          id: createdEvent.data.id,
          title: createdEvent.data.title,
          description: createdEvent.data.description,
          startTime: createdEvent.data.startTime,
          endTime: createdEvent.data.endTime,
          isAllDay: createdEvent.data.isAllDay
        },
        message: `Event "${createdEvent.data.title}" has been successfully created!`
      }

      onApprove(toolCallId, JSON.stringify(result))
    } catch (error) {
      const errorResult = {
        type: "ERROR",
        message: `Failed to create event: ${error instanceof Error ? error.message : "Unknown error"}`
      }
      onApprove(toolCallId, JSON.stringify(errorResult))
    }
  }

  const handleReject = async () => {
    const result = {
      type: "EVENT_CANCELLED",
      data: {
        title: input.title,
        description: input.description,
        startTime: input.startTime,
        endTime: input.endTime,
        isAllDay: input.isAllDay
      },
      message: "Event creation was cancelled by user."
    }

    onReject(toolCallId, JSON.stringify(result))
  }

  const formatEventTime = (startTime: string, endTime?: string, isAllDay?: boolean) => {
    try {
      const start = new Date(startTime)
      const end = endTime ? new Date(endTime) : null
      return formatEventTimeRange(start, end, isAllDay)
    } catch {
      return startTime
    }
  }

  return (
    <Card aria-label={`Create Event: ${input.title}`}>
      <CardHeader className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Icon name="Plus" className="h-5 w-5" />
            <Typography variant="h5" className="line-clamp-2 leading-tight">
              Create Event
            </Typography>
          </div>
          <Typography affects={["muted", "small"]}>Review the details before creating</Typography>
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
        {input.description && (
          <Typography affects={["muted", "small"]} className="line-clamp-4">
            {input.description.trim()}
          </Typography>
        )}
        <div className="flex items-center gap-2">
          <Icon name="Clock" className="text-muted-foreground h-4 w-4" />
          <Typography affects={["muted", "small"]}>
            {formatEventTime(input.startTime, input.endTime, input.isAllDay)}
          </Typography>
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="flex items-end justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleReject}
          disabled={createEventMutation.isPending}
          isLoading={createEventMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleApprove}
          disabled={createEventMutation.isPending}
          isLoading={createEventMutation.isPending}
        >
          Create
        </Button>
      </CardFooter>
    </Card>
  )
}

export { EventCreationConfirmation }
