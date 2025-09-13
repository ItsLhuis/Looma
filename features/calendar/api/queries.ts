import axios from "axios"

import { useQuery } from "@tanstack/react-query"

import type { GetEventResponse, ListEventsRequest, ListEventsResponse } from "./types"

const base = "/api/events"

export const eventsKeys = {
  all: [{ scope: "events" }] as const,
  lists: () => [{ ...eventsKeys.all[0], entity: "list" }] as const,
  list: (params: ListEventsRequest) => [{ ...eventsKeys.lists()[0], params }] as const,
  details: () => [{ ...eventsKeys.all[0], entity: "detail" }] as const,
  detail: (id: string) => [{ ...eventsKeys.details()[0], id }] as const
}

export function useListEvents(params: ListEventsRequest) {
  const url = new URL(base, globalThis.location?.origin ?? "http://localhost")

  if (params.limit != null) url.searchParams.set("limit", String(params.limit))
  if (params.offset != null) url.searchParams.set("offset", String(params.offset))
  if (params.orderBy?.column) url.searchParams.set("orderBy[column]", String(params.orderBy.column))
  if (params.orderBy?.direction)
    url.searchParams.set("orderBy[direction]", String(params.orderBy.direction))

  if (params.filters?.search) url.searchParams.set("filters[search]", String(params.filters.search))
  if (params.filters?.isAllDay !== undefined)
    url.searchParams.set("filters[isAllDay]", String(params.filters.isAllDay))
  if (params.filters?.dateRange) {
    url.searchParams.set("filters[dateRange][start]", params.filters.dateRange.start.toISOString())
    url.searchParams.set("filters[dateRange][end]", params.filters.dateRange.end.toISOString())
  }

  return useQuery<ListEventsResponse>({
    queryKey: eventsKeys.list(params),
    queryFn: async () => {
      const res = await axios.get<ListEventsResponse>(url.toString(), { withCredentials: true })
      return res.data
    }
  })
}

export function useGetEvent(id: string, enabled = true) {
  const url = `${base}/${id}`

  return useQuery<GetEventResponse>({
    queryKey: eventsKeys.detail(id),
    queryFn: async () => {
      const res = await axios.get<GetEventResponse>(url, { withCredentials: true })
      return res.data
    },
    enabled
  })
}
