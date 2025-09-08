import { Fragment } from "react"

import { Container, Navbar } from "@/components/layout"

export default async function SettingsPage() {
  return (
    <Fragment>
      <Navbar title="Settings" />
      <Container>
        <p>Content to render</p>
      </Container>
    </Fragment>
  )
}
