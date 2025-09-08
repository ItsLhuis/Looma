import { Fragment } from "react"

import { Container, Navbar } from "@/components/layout"

export default async function NotesPage() {
  return (
    <Fragment>
      <Navbar title="Notes" />
      <Container>
        <p>Content to render</p>
      </Container>
    </Fragment>
  )
}
