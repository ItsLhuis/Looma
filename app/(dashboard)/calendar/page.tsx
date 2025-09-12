"use client"

import { Fragment, useMemo, useState } from "react"

import { Container, Navbar } from "@/components/layout"
import { FullScreenCalendar } from "@/components/ui"

const seed = [
  {
    day: new Date("2025-01-02"),
    events: [
      { id: 1, name: "Q1 Planning Session" },
      { id: 2, name: "Team Sync" }
    ]
  },
  {
    day: new Date("2025-01-07"),
    events: [
      { id: 3, name: "Product Launch Review" },
      { id: 4, name: "Marketing Sync" },
      { id: 5, name: "Vendor Meeting" }
    ]
  },
  {
    day: new Date("2025-01-10"),
    events: [{ id: 6, name: "Team Building Workshop" }]
  },
  {
    day: new Date("2025-01-13"),
    events: [
      { id: 7, name: "Budget Analysis Meeting" },
      { id: 8, name: "Sprint Planning" },
      { id: 9, name: "Design Review" }
    ]
  },
  {
    day: new Date("2025-01-16"),
    events: [
      { id: 10, name: "Client Presentation" },
      { id: 11, name: "Team Lunch" },
      { id: 12, name: "Project Status Update" }
    ]
  }
]

export default function CalendarPage() {
  const initialEvents = useMemo(() => {
    const events = [] as Array<{
      id: string
      title: string
      description?: string | null
      startTime: Date
      endTime?: Date | null
      isAllDay?: boolean
    }>
    for (const d of seed) {
      for (const ev of d.events) {
        events.push({
          id: String(ev.id),
          title: ev.name,
          description: null,
          startTime: new Date(d.day),
          endTime: null,
          isAllDay: true
        })
      }
    }
    return events
  }, [])

  const [events, setEvents] = useState(initialEvents)

  return (
    <Fragment>
      <Navbar title="Calendar" />
      <Container>
        <FullScreenCalendar
          events={events}
          onCreateEvent={async (payload) => {
            const id = (globalThis.crypto?.randomUUID?.() || Date.now().toString()) as string
            setEvents((prev) => [...prev, { id, ...payload }])
          }}
          onUpdateEvent={async (id, payload) => {
            setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...payload } : e)))
          }}
          onDeleteEvent={async (id) => {
            setEvents((prev) => prev.filter((e) => e.id !== id))
          }}
        />
      </Container>
    </Fragment>
  )
}
