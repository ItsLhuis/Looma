"use client"

import { Fragment, use } from "react"

import { Container, Navbar } from "@/components/layout"

import { NoteEditor } from "@/features/notes/components"

export default function EditNotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <Fragment>
      <Navbar title="Edit Note" />
      <Container>
        <NoteEditor mode="update" noteId={id} />
      </Container>
    </Fragment>
  )
}
