import { Fragment } from "react"

import { Button, Icon } from "@/components/ui"
import Link from "next/link"

import { Container, Navbar } from "@/components/layout"

import { NotesList } from "@/features/notes/components"

export default async function NotesPage() {
  return (
    <Fragment>
      <Navbar title="Notes">
        <Button asChild variant="outline" size="sm">
          <Link href="/notes/new">
            <Icon name="Plus" />
            New Note
          </Link>
        </Button>
      </Navbar>
      <Container>
        <NotesList />
      </Container>
    </Fragment>
  )
}
