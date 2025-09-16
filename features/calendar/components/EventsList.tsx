"use client"

import { useCallback, useEffect, useState } from "react"

import { useListEvents } from "@/features/calendar/api"

import { Skeleton, Spinner, Typography } from "@/components/ui"
import { CalendarManager } from "./CalendarManager"
import { EventsFilters } from "./EventsFilters"

import { type EventFilters, type QueryEventsParams } from "@/features/calendar/types"

export type EventsListProps = {
  initialParams?: QueryEventsParams & {
    shouldOpenCreateDialog?: boolean
  }
  onCreateDialogClose?: () => void
}

function EventsList({ initialParams, onCreateDialogClose }: EventsListProps) {
  const [params, setParams] = useState<QueryEventsParams>({
    limit: 1000,
    offset: 0,
    orderBy: { column: "startTime", direction: "asc" },
    ...initialParams
  })

  const [shouldOpenCreateDialog, setShouldOpenCreateDialog] = useState(
    initialParams?.shouldOpenCreateDialog ?? false
  )

  const { data, isLoading, isError, isFetching } = useListEvents(params)

  const onFiltersChange = useCallback(
    (filters: EventFilters) => {
      const newParams: QueryEventsParams = {
        limit: params.limit,
        offset: 0,
        orderBy: params.orderBy,
        filters: {
          ...(filters.search && { search: filters.search }),
          ...(filters.isAllDay !== undefined && { isAllDay: filters.isAllDay }),
          ...(filters.dateRange && { dateRange: filters.dateRange })
        }
      }

      setParams(newParams)
    },
    [params.limit, params.orderBy]
  )

  const handleCreateDialogClose = () => {
    onCreateDialogClose?.()
  }

  useEffect(() => {
    setShouldOpenCreateDialog(initialParams?.shouldOpenCreateDialog ?? false)
  }, [initialParams?.shouldOpenCreateDialog])

  const total = data?.total ?? 0

  const defaultFilters: EventFilters = {
    search: params.filters?.search,
    isAllDay: params.filters?.isAllDay,
    dateRange: params.filters?.dateRange
  }

  const headerContent = (
    <div className="min-h-8">
      <Typography affects={["lead", "bold"]} className="shrink-0">
        {isFetching ? <Spinner /> : `${total} events`}
      </Typography>
    </div>
  )

  const filtersContent = (
    <EventsFilters defaultFilters={defaultFilters} onChange={onFiltersChange} />
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        {headerContent}
        {filtersContent}
        <div className="grid h-full w-full grid-cols-1 gap-3">
          <Skeleton className="h-[600px]" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-4">
        {headerContent}
        {filtersContent}
        <div className="flex h-full items-center justify-center py-6">
          <Typography className="text-destructive" affects={["small"]}>
            Failed to load calendar events
          </Typography>
        </div>
      </div>
    )
  }

  if (data && data.data.length === 0) {
    return (
      <div className="space-y-4">
        {headerContent}
        {filtersContent}
        <div className="flex h-full items-center justify-center py-6">
          <Typography affects={["muted", "small"]}>No events found</Typography>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {headerContent}
      {filtersContent}
      <CalendarManager
        initialParams={params}
        shouldOpenCreateDialog={shouldOpenCreateDialog}
        onCreateDialogClose={handleCreateDialogClose}
      />
    </div>
  )
}

export { EventsList }
