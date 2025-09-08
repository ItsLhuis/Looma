import { Fragment } from "react"

import { Container, Navbar } from "@/components/layout"

export default async function CalendarPage() {
  return (
    <Fragment>
      <Navbar title="Calendar" />
      <Container>
        <p>Content to render</p>
      </Container>
    </Fragment>
  )
}
