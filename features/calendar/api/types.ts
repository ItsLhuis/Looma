import type { InsertEventType, UpdateEventType } from "@/features/calendar/schemas"
import type { Event, QueryEventsParams } from "@/features/calendar/types"

export type ListEventsRequest = QueryEventsParams
export type ListEventsResponse = { data: Event[]; total: number }

export type GetEventResponse = { data: Event }

export type CreateEventRequest = InsertEventType
export type CreateEventResponse = { data: Event }

export type UpdateEventRequest = UpdateEventType
export type UpdateEventResponse = { data: Event }

export type DeleteEventResponse = { data: Event }
