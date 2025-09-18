"use client"

import { Fragment, use } from "react"

import { Container, Navbar } from "@/components/layout"

import { MemoryEditor } from "@/features/memories/components"

export default function EditMemoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <Fragment>
      <Navbar title="Edit Memory" />
      <Container>
        <MemoryEditor mode="update" memoryId={id} />
      </Container>
    </Fragment>
  )
}
