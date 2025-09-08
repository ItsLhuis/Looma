import { Fragment } from "react"

import { Container, Navbar } from "@/components/layout"

export default async function CategoriesPage() {
  return (
    <Fragment>
      <Navbar title="Categories" />
      <Container>
        <p>Content to render</p>
      </Container>
    </Fragment>
  )
}
