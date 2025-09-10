import { Fragment } from "react"

import { Button, Icon } from "@/components/ui"
import Link from "next/link"

import { Container, Navbar } from "@/components/layout"

import { TasksList } from "@/features/tasks/components"

export default async function TasksPage() {
  return (
    <Fragment>
      <Navbar title="Tasks">
        <Button asChild variant="outline" size="sm">
          <Link href="/tasks/new">
            <Icon name="Plus" />
            New Task
          </Link>
        </Button>
      </Navbar>
      <Container>
        <TasksList />
      </Container>
    </Fragment>
  )
}
