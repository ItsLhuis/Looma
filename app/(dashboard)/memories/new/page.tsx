"use client"

import { Fragment } from "react"

import { Container, Navbar } from "@/components/layout"

import { MemoryEditor } from "@/features/memories/components"

export default function NewMemoryPage() {
  return (
    <Fragment>
      <Navbar title="New Memory" />
      <Container>
        <MemoryEditor />
      </Container>
    </Fragment>
  )
}
