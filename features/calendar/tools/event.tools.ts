import { tool } from "ai"

import { getEventById, getEvents, getEventsByDateRange, searchEvents } from "../api/dal"

import {
  createEventToolSchema,
  deleteEventToolSchema,
  getEventByIdToolSchema,
  getEventsByAllDayToolSchema,
  getEventsByDateRangeToolSchema,
  getEventsStatsToolSchema,
  getTodayEventsToolSchema,
  getUpcomingEventsToolSchema,
  listEventsToolSchema,
  searchEventsToolSchema,
  updateEventToolSchema,
  type GetEventByIdToolInput,
  type GetEventsByAllDayToolInput,
  type GetEventsByDateRangeToolInput,
  type GetEventsStatsToolInput,
  type GetUpcomingEventsToolInput,
  type ListEventsToolInput,
  type SearchEventsToolInput
} from "./schemas/event.schema"

import type { EventListResult, EventSearchResult, EventStats } from "./types/event.types"

export const createEventTool = tool({
  description:
    "Create a new event. Use when user wants to create/save a new calendar event. REQUIRED: title (string), startTime (ISO datetime string). OPTIONAL: description, endTime (ISO datetime string), isAllDay (boolean). Supports all-day events and requires user confirmation before execution.",
  inputSchema: createEventToolSchema
})

export const updateEventTool = tool({
  description:
    "Update an existing event. Use when user wants to modify an existing calendar event. REQUIRED: id (UUID). OPTIONAL: title, description, startTime, endTime, isAllDay. Requires user confirmation before execution.",
  inputSchema: updateEventToolSchema
})

export const deleteEventTool = tool({
  description:
    "Delete an event. Use when user wants to remove an event from the calendar. REQUIRED: id (UUID). Requires user confirmation before execution.",
  inputSchema: deleteEventToolSchema
})

export const listEventsTool = tool({
  description:
    "Retrieve a paginated list of events with advanced filtering. Use when user wants to see all events or filtered events. Supports filtering by search, all-day status, date range, and custom sorting options. Supports limit/offset pagination and returns total count.",
  inputSchema: listEventsToolSchema,
  execute: async (input: ListEventsToolInput) => {
    const result = await getEvents({
      ...input,
      filters: input.filters
        ? {
            ...input.filters,
            dateRange: input.filters.dateRange
              ? {
                  start: new Date(input.filters.dateRange.start),
                  end: new Date(input.filters.dateRange.end)
                }
              : undefined
          }
        : undefined
    })
    return {
      events: result.data,
      total: result.total,
      limit: input.limit || 20,
      offset: input.offset || 0,
      hasMore: (input.offset || 0) + (input.limit || 20) < result.total,
      filters: input.filters
    } as EventListResult
  }
})

export const getEventByIdTool = tool({
  description:
    "Retrieve a specific event by its unique ID. Use when user wants to view details of a specific event. Returns all metadata, timestamps, and event details. Returns error if event not found.",
  inputSchema: getEventByIdToolSchema,
  execute: async (input: GetEventByIdToolInput) => {
    const event = await getEventById(input.id)
    if (!event) {
      return { error: "Event not found", event: null }
    }

    return { event }
  }
})

export const searchEventsTool = tool({
  description:
    "Search for events by text content. Use when user wants to find events containing specific words or phrases. Performs full-text search across event titles and descriptions. Returns matching events with relevance scoring and search query metadata.",
  inputSchema: searchEventsToolSchema,
  execute: async (input: SearchEventsToolInput) => {
    const events = await searchEvents(input.query)
    return {
      events,
      query: input.query,
      count: events.length
    } as EventSearchResult
  }
})

export const getEventsStatsTool = tool({
  description:
    "Get comprehensive statistics about events. Use when user wants to see event analytics, counts, and insights. Supports optional date range filtering. Returns total counts, all-day vs timed events, upcoming vs past events, and other metrics.",
  inputSchema: getEventsStatsToolSchema,
  execute: async (input: GetEventsStatsToolInput) => {
    const now = new Date()
    const startDate = input.dateRange
      ? new Date(input.dateRange.start)
      : new Date(now.getFullYear(), 0, 1)
    const endDate = input.dateRange
      ? new Date(input.dateRange.end)
      : new Date(now.getFullYear() + 1, 0, 1)

    const events = await getEventsByDateRange(startDate, endDate)

    const totalEvents = events.length
    const allDayEvents = events.filter((e) => e.isAllDay).length
    const timedEvents = totalEvents - allDayEvents
    const upcomingEvents = events.filter((e) => new Date(e.startTime) > now).length
    const pastEvents = totalEvents - upcomingEvents

    const timedEventsWithDuration = events.filter((e) => !e.isAllDay && e.endTime)
    const averageEventDuration =
      timedEventsWithDuration.length > 0
        ? timedEventsWithDuration.reduce((sum, e) => {
            const duration = new Date(e.endTime!).getTime() - new Date(e.startTime).getTime()
            return sum + duration
          }, 0) /
          timedEventsWithDuration.length /
          (1000 * 60)
        : undefined

    const dayCounts: Record<string, number> = {}
    events.forEach((e) => {
      const day = new Date(e.startTime).toDateString()
      dayCounts[day] = (dayCounts[day] || 0) + 1
    })
    const mostActiveDay = Object.entries(dayCounts).reduce(
      (a, b) => (a[1] > b[1] ? a : b),
      ["", 0]
    )[0]

    return {
      total: totalEvents,
      allDayEvents,
      timedEvents,
      upcomingEvents,
      pastEvents,
      averageEventDuration,
      mostActiveDay: mostActiveDay || undefined,
      filters: input.dateRange
        ? {
            dateRange: {
              start: new Date(input.dateRange.start),
              end: new Date(input.dateRange.end)
            }
          }
        : undefined
    } as EventStats
  }
})

export const getUpcomingEventsTool = tool({
  description:
    "Get upcoming events. Use when user wants to see events that are scheduled in the future. Returns events ordered by start time, with optional limit. Perfect for showing what's coming next.",
  inputSchema: getUpcomingEventsToolSchema,
  execute: async (input: GetUpcomingEventsToolInput) => {
    const now = new Date()
    const futureDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)

    const events = await getEventsByDateRange(now, futureDate)
    const upcomingEvents = events
      .filter((e) => new Date(e.startTime) > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, input.limit || 10)

    return {
      events: upcomingEvents,
      total: upcomingEvents.length,
      limit: input.limit || 10,
      offset: 0,
      hasMore: false,
      filters: { upcoming: true }
    } as EventListResult
  }
})

export const getTodayEventsTool = tool({
  description:
    "Get today's events. Use when user wants to see all events scheduled for today. Returns both all-day and timed events for the current day.",
  inputSchema: getTodayEventsToolSchema,
  execute: async () => {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    const events = await getEventsByDateRange(startOfDay, endOfDay)
    const todayEvents = events.filter((e) => {
      const eventDate = new Date(e.startTime)
      return eventDate >= startOfDay && eventDate < endOfDay
    })

    return {
      events: todayEvents,
      total: todayEvents.length,
      limit: 50,
      offset: 0,
      hasMore: false,
      filters: { today: true }
    } as EventListResult
  }
})

export const getEventsByAllDayTool = tool({
  description:
    "Get events filtered by all-day status. Use when user wants to see only all-day events or only timed events. Returns events matching the specified all-day status.",
  inputSchema: getEventsByAllDayToolSchema,
  execute: async (input: GetEventsByAllDayToolInput) => {
    const result = await getEvents({
      filters: { isAllDay: input.isAllDay },
      limit: 100,
      offset: 0
    })

    return {
      events: result.data,
      total: result.total,
      limit: 100,
      offset: 0,
      hasMore: result.total > 100,
      filters: { isAllDay: input.isAllDay }
    } as EventListResult
  }
})

export const getEventsByDateRangeTool = tool({
  description:
    "Get events within a specific date range. Use when user wants to see events between two dates. Returns events that start within the specified range, ordered by start time.",
  inputSchema: getEventsByDateRangeToolSchema,
  execute: async (input: GetEventsByDateRangeToolInput) => {
    const startDate = new Date(input.startDate)
    const endDate = new Date(input.endDate)

    const events = await getEventsByDateRange(startDate, endDate)

    return {
      events,
      total: events.length,
      limit: events.length,
      offset: 0,
      hasMore: false,
      filters: {
        dateRange: {
          start: new Date(input.startDate),
          end: new Date(input.endDate)
        }
      }
    } as EventListResult
  }
})

export const eventTools = {
  createEvent: createEventTool,
  updateEvent: updateEventTool,
  deleteEvent: deleteEventTool,
  listEvents: listEventsTool,
  getEventById: getEventByIdTool,
  searchEvents: searchEventsTool,
  getEventsStats: getEventsStatsTool,
  getUpcomingEvents: getUpcomingEventsTool,
  getTodayEvents: getTodayEventsTool,
  getEventsByAllDay: getEventsByAllDayTool,
  getEventsByDateRange: getEventsByDateRangeTool
} as const

export type EventToolName = keyof typeof eventTools
