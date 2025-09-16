import { Fragment } from "react"

import Link from "next/link"

import { Container, Navbar } from "@/components/layout"
import { Button, Icon } from "@/components/ui"

import { TasksList } from "@/features/tasks/components"

export default async function TasksPage() {
  return (
    <Fragment>
      <Navbar title="Tasks">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/tasks/kanban">
              <Icon name="Columns" />
              Kanban View
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
        <TasksList />
      </Container>
    </Fragment>
  )
}
