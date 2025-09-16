"use client"

import { Fragment, useState } from "react"

import { Container, Navbar } from "@/components/layout"
import { Button, Icon } from "@/components/ui"

import { EventsList } from "@/features/calendar/components"

export default function CalendarPage() {
  const [shouldOpenCreateDialog, setShouldOpenCreateDialog] = useState(false)

  const handleOpenCreateDialog = () => {
    setShouldOpenCreateDialog(true)
  }

  const handleCreateDialogClose = () => {
    setShouldOpenCreateDialog(false)
  }

  return (
    <Fragment>
      <Navbar title="Calendar">
        <Button variant="outline" size="sm" onClick={handleOpenCreateDialog}>
          <Icon name="Plus" />
          New Event
        </Button>
      </Navbar>
      <Container>
        <EventsList
          initialParams={{ shouldOpenCreateDialog }}
          onCreateDialogClose={handleCreateDialogClose}
        />
      </Container>
    </Fragment>
  )
}
