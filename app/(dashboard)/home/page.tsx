"use client"

import { Fragment } from "react"

import { useDashboardData } from "@/features/dashboard/hooks"

import Link from "next/link"

import { Container, Navbar } from "@/components/layout"
import { Button, Icon } from "@/components/ui"

import { DashboardOverview } from "@/features/dashboard/components"

export default function HomePage() {
  const { data, isLoading, isError } = useDashboardData()

  return (
    <Fragment>
      <Navbar title="Dashboard">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/notes">
              <Icon name="FileText" />
              Notes
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/tasks">
              <Icon name="CheckSquare" />
              Tasks
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/calendar">
              <Icon name="Calendar" />
              Calendar
            </Link>
          </Button>
        </div>
      </Navbar>
      <Container>
        <DashboardOverview data={data} isLoading={isLoading} isError={isError} />
      </Container>
    </Fragment>
  )
}
