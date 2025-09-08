import { Fragment } from "react"

import { Container, Navbar } from "@/components/layout"

export default async function HomePage() {
  return (
    <Fragment>
      <Navbar title="Home" />
      <Container>
        <p>Content to render</p>
      </Container>
    </Fragment>
  )
}
