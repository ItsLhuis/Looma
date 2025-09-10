"use client"

import { Fragment, use } from "react"

import { Container, Navbar } from "@/components/layout"

import { TaskEditor } from "@/features/tasks/components"

export default function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <Fragment>
      <Navbar title="Edit Task" />
      <Container>
        <TaskEditor mode="update" taskId={id} />
      </Container>
    </Fragment>
  )
}
