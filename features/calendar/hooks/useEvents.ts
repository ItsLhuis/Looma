"use client"

import { useCallback, useState } from "react"

import { useCreateEvent, useListEvents, useUpdateEvent } from "@/features/calendar/api"

import { type QueryEventsParams } from "@/features/calendar/types"

export function useEvents(initialParams: QueryEventsParams = { limit: 1000, offset: 0 }) {
  const [params, setParams] = useState<QueryEventsParams>(initialParams)

  const list = useListEvents(params)

  const create = useCreateEvent()
  const update = useUpdateEvent("")

  const setSearch = useCallback(
    (search?: string) => setParams((p) => ({ ...p, offset: 0, filters: { ...p.filters, search } })),
    []
  )
  const setPage = useCallback(
    (offset: number) => setParams((p) => ({ ...p, offset: Math.max(0, offset) })),
    []
  )

  const setDateRange = useCallback(
    (dateRange?: { start: Date; end: Date }) =>
      setParams((p) => ({ ...p, offset: 0, filters: { ...p.filters, dateRange } })),
    []
  )

  const setFilters = useCallback(
    (filters: QueryEventsParams["filters"]) => setParams((p) => ({ ...p, offset: 0, filters })),
    []
  )

  const clearFilters = useCallback(() => {
    setParams((p) => ({ ...p, offset: 0, filters: undefined }))
  }, [])

  return {
    list,
    create,
    update,
    setSearch,
    setPage,
    setDateRange,
    setFilters,
    clearFilters,
    params,
    setParams
  }
}
