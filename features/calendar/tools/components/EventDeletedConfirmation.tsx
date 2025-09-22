"use client"

import { cn } from "@/lib/utils"

import { formatEventTimeRange } from "@/lib/date"

import { Badge, Card, CardContent, CardHeader, Icon, Separator, Typography } from "@/components/ui"

import {
  getActionStatusClasses,
  getActionStatusColor,
  getActionStatusIcon
} from "@/features/calendar/utils/status.utils"

import type { EventDeleteConfirmationData } from "../types/event.types"

type EventDeletedConfirmationProps = {
  eventData: EventDeleteConfirmationData
}

function EventDeletedConfirmation({ eventData }: EventDeletedConfirmationProps) {
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
    <Card
      className={cn("flex flex-col", getActionStatusClasses("success"))}
      aria-label={`Event Deleted: ${eventData.title}`}
    >
      <CardHeader className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Icon
              name={getActionStatusIcon("success")}
              className={cn("h-5 w-5", getActionStatusColor("success"))}
            />
            <Typography variant="h5" className="line-clamp-2 leading-tight">
              Event Deleted Successfully
            </Typography>
          </div>
          <Typography affects={["muted", "small"]}>Event has been successfully deleted</Typography>
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
        <div className="flex items-center gap-2">
          <Icon name="Clock" className="text-muted-foreground h-4 w-4" />
          <Typography affects={["muted", "small"]}>
            {formatEventTime(eventData.startTime, eventData.endTime, eventData.isAllDay)}
          </Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export { EventDeletedConfirmation }
