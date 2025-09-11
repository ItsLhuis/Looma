"use client"

import { Fragment } from "react"

import { Button, Icon } from "@/components/ui"
import Link from "next/link"

import { Container, Navbar } from "@/components/layout"

import { TasksKanban } from "@/features/tasks/components"

export default function TasksKanbanPage() {
  return (
    <Fragment>
      <Navbar title="Tasks">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/tasks">
              <Icon name="List" />
              List View
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/tasks/new">
              <Icon name="Plus" />
              New Task
            </Link>
          </Button>
        </div>
      </Navbar>
      <Container>
        <TasksKanban />
      </Container>
    </Fragment>
  )
}
