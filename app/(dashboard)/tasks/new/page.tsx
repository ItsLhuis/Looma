"use client"

import { Fragment } from "react"

import { Container, Navbar } from "@/components/layout"

import { TaskEditor } from "@/features/tasks/components"

export default function NewTaskPage() {
  return (
    <Fragment>
      <Navbar title="New Task" />
      <Container>
        <TaskEditor />
      </Container>
    </Fragment>
  )
}
