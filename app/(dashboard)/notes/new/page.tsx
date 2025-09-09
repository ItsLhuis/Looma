"use client"

import { Fragment } from "react"

import { Container, Navbar } from "@/components/layout"

import { NoteEditor } from "@/features/notes/components"

export default function NewNotePage() {
  return (
    <Fragment>
      <Navbar title="New Note" />
      <Container>
        <NoteEditor />
      </Container>
    </Fragment>
  )
}
