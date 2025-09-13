"use client"

import { useMemo, useState } from "react"

import { FullScreenCalendar } from "@/components/ui"

import {
  useCreateEvent,
  useDeleteEvent,
  useListEvents,
  useUpdateEvent
} from "@/features/calendar/api"

import type { QueryEventsParams } from "@/features/calendar/types"

export type CalendarManagerProps = {
  initialParams?: QueryEventsParams
  shouldOpenCreateDialog?: boolean
  onCreateDialogClose?: () => void
}

function CalendarManager({
  initialParams,
  shouldOpenCreateDialog: externalShouldOpenCreateDialog,
  onCreateDialogClose: externalOnCreateDialogClose
}: CalendarManagerProps) {
  const [activeEventId, setActiveEventId] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const [internalShouldOpenCreateDialog, setInternalShouldOpenCreateDialog] = useState(false)

  const params: QueryEventsParams = {
    limit: 1000,
    offset: 0,
    orderBy: { column: "startTime", direction: "asc" },
    ...initialParams
  }

  const { data: eventsData, isLoading, isError } = useListEvents(params)

  const createMutation = useCreateEvent()
  const updateMutation = useUpdateEvent(activeEventId)
  const deleteMutation = useDeleteEvent(activeEventId)

  const events = useMemo(() => {
    if (!eventsData?.data) return []
    return eventsData.data.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      startTime: new Date(event.startTime),
      endTime: event.endTime ? new Date(event.endTime) : null,
      isAllDay: event.isAllDay
    }))
  }, [eventsData])

  const handleCreateEvent = async (payload: {
    title: string
    description?: string | null
    startTime: Date
    endTime?: Date | null
    isAllDay: boolean
  }) => {
    await createMutation.mutateAsync({
      title: payload.title,
      description: payload.description,
      startTime: payload.startTime,
      endTime: payload.endTime,
      isAllDay: payload.isAllDay
    })
  }

  const handleCreateDialogClose = () => {
    setInternalShouldOpenCreateDialog(false)
    externalOnCreateDialogClose?.()
  }

  const shouldOpenCreateDialog = externalShouldOpenCreateDialog ?? internalShouldOpenCreateDialog

  const handleUpdateEvent = async (
    id: string,
    payload: {
      title?: string
      description?: string | null
      startTime?: Date | null
      endTime?: Date | null
      isAllDay?: boolean
    }
  ) => {
    setActiveEventId(id)

    const updateData: {
      title?: string
      description?: string | null
      startTime?: Date | null
      endTime?: Date | null
      isAllDay?: boolean
    } = {}

    if (payload.title !== undefined) updateData.title = payload.title
    if (payload.description !== undefined) updateData.description = payload.description
    if (payload.startTime !== undefined) updateData.startTime = payload.startTime
    if (payload.endTime !== undefined) updateData.endTime = payload.endTime
    if (payload.isAllDay !== undefined) updateData.isAllDay = payload.isAllDay

    if (updateData.title) {
      await updateMutation.mutateAsync({
        title: updateData.title,
        ...(updateData.description !== undefined && { description: updateData.description }),
        ...(updateData.startTime !== undefined && { startTime: updateData.startTime }),
        ...(updateData.endTime !== undefined && { endTime: updateData.endTime }),
        ...(updateData.isAllDay !== undefined && { isAllDay: updateData.isAllDay })
      })
    }
  }

  const handleDeleteEvent = async (id: string) => {
    setActiveEventId(id)
    await deleteMutation.mutateAsync()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading calendar...</div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-destructive">Failed to load calendar events</div>
      </div>
    )
  }

  return (
    <FullScreenCalendar
      events={events}
      onCreateEvent={handleCreateEvent}
      onUpdateEvent={handleUpdateEvent}
      onDeleteEvent={handleDeleteEvent}
      selectedDate={selectedDate}
      onDateSelect={setSelectedDate}
      showCreateButton={false}
      shouldOpenCreateDialog={shouldOpenCreateDialog}
      onCreateDialogClose={handleCreateDialogClose}
    />
  )
}

export { CalendarManager }
