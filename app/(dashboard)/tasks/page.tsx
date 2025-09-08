import { Fragment } from "react"

import { Container, Navbar } from "@/components/layout"

export default async function TasksPage() {
  return (
    <Fragment>
      <Navbar title="Tasks" />
      <Container>
        <p>Content to render</p>
      </Container>
    </Fragment>
  )
}
