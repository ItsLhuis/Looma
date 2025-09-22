"use client"

import { cn } from "@/lib/utils"

import { formatEventTimeRange } from "@/lib/date"

import { Badge, Card, CardContent, CardHeader, Icon, Separator, Typography } from "@/components/ui"

import {
  getActionStatusClasses,
  getActionStatusColor,
  getActionStatusIcon
} from "@/features/calendar/utils/status.utils"

import type { UpdateEventToolInput } from "../schemas/event.schema"

type EventUpdateCancelledConfirmationProps = {
  eventData: UpdateEventToolInput
}

function EventUpdateCancelledConfirmation({ eventData }: EventUpdateCancelledConfirmationProps) {
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
    <Card
      className={cn("flex flex-col", getActionStatusClasses("cancelled"))}
      aria-label={`Event Update Cancelled: ${eventData.title || eventData.id}`}
    >
      <CardHeader className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Icon
              name={getActionStatusIcon("cancelled")}
              className={cn("h-5 w-5", getActionStatusColor("cancelled"))}
            />
            <Typography variant="h5" className="line-clamp-2 leading-tight">
              Event Update Cancelled
            </Typography>
          </div>
          <Typography affects={["muted", "small"]}>Event update was cancelled by user</Typography>
        </div>
        <div className="flex max-w-full shrink-0 flex-col flex-wrap items-end gap-1.5 overflow-hidden">
          {eventData.isAllDay && (
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
          {eventData.title}
        </Typography>
        {eventData.description ? (
          <Typography affects={["muted", "small"]} className="line-clamp-4">
            {eventData.description.trim()}
          </Typography>
        ) : (
          <Typography className="italic" affects={["muted", "small"]}>
            No description
          </Typography>
        )}
        {eventData.startTime && (
          <div className="flex items-center gap-2">
            <Icon name="Clock" className="text-muted-foreground h-4 w-4" />
            <Typography affects={["muted", "small"]}>
              {formatEventTime(eventData.startTime, eventData.endTime, eventData.isAllDay)}
            </Typography>
          </div>
        )}
        <div className="bg-error/10 border-error/20 rounded-md border p-3">
          <Typography affects={["muted", "small"]} className="text-center">
            This event was not updated. You can ask me to update it again if needed.
          </Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export { EventUpdateCancelledConfirmation }
