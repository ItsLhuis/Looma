import { Fragment } from "react"

import { Button, Icon } from "@/components/ui"
import Link from "next/link"

import { Container, Navbar } from "@/components/layout"

import { MemoriesList } from "@/features/memories/components"

export default async function MemoriesPage() {
  return (
    <Fragment>
      <Navbar title="Memories">
        <Button asChild variant="outline" size="sm">
          <Link href="/memories/new">
            <Icon name="Plus" />
            New Memory
          </Link>
        </Button>
      </Navbar>
      <Container>
        <MemoriesList />
      </Container>
    </Fragment>
  )
}
