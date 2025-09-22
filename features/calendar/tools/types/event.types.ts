import type { Event } from "@/features/calendar/types"

import type {
  ApprovalStatus,
  CreateEventToolInput,
  DeleteEventToolInput,
  UpdateEventToolInput
} from "../schemas/event.schema"

export type EventCreationToolCall = {
  toolCallId: string
  toolName: "createEvent"
  input: CreateEventToolInput
  state: "input-available" | "result-available"
  output?: ApprovalStatus | string
}

export type EventUpdateToolCall = {
  toolCallId: string
  toolName: "updateEvent"
  input: UpdateEventToolInput
  state: "input-available" | "result-available"
  output?: ApprovalStatus | string
}

export type EventDeleteToolCall = {
  toolCallId: string
  toolName: "deleteEvent"
  input: DeleteEventToolInput
  state: "input-available" | "result-available"
  output?: ApprovalStatus | string
}

export type EventCreationConfirmationData = {
  toolCallId: string
  approved: boolean
  eventData: CreateEventToolInput
}

export type EventUpdateConfirmationData = {
  toolCallId: string
  approved: boolean
  eventData: UpdateEventToolInput
}

export type EventDeleteConfirmationData = {
  id: string
  title: string
  startTime: string
  endTime?: string
  isAllDay: boolean
}

export type EventCreationResult = {
  success: boolean
  eventId?: string
  message: string
  eventData?: CreateEventToolInput
}

export type EventUpdateResult = {
  success: boolean
  eventId?: string
  message: string
  eventData?: UpdateEventToolInput
}

export type EventDeleteResult = {
  success: boolean
  eventId?: string
  message: string
  eventData?: DeleteEventToolInput
}

export type EventStats = {
  total: number
  allDayEvents: number
  timedEvents: number
  upcomingEvents: number
  pastEvents: number
  averageEventDuration?: number
  mostActiveDay?: string
  filters?: {
    isAllDay?: boolean
    dateRange?: { start?: Date; end?: Date }
  }
}

export type EventToolResult = {
  type:
    | "EVENT_CREATED"
    | "EVENT_UPDATED"
    | "EVENT_DELETED"
    | "EVENT_CREATION_CANCELLED"
    | "EVENT_UPDATE_CANCELLED"
    | "EVENT_DELETE_CANCELLED"
    | "ERROR"
  data?: {
    eventId?: string
    eventData?: CreateEventToolInput | UpdateEventToolInput | DeleteEventToolInput
    message?: string
  }
  message: string
}

export type EventListResult = {
  events: Event[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
  filters?: {
    search?: string
    isAllDay?: boolean
    dateRange?: { start?: Date; end?: Date }
  }
}

export type EventSearchResult = {
  events: Event[]
  query: string
  count: number
}
