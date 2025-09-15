import { NextRequest, NextResponse } from "next/server"

import { getDashboardOverview } from "@/features/dashboard/api/dal"

import type { GetDashboardOverviewRequest } from "@/features/dashboard/api/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters: GetDashboardOverviewRequest = {}

    const startDate = searchParams.get("dateRange[start]")
    const endDate = searchParams.get("dateRange[end]")
    if (startDate && endDate) {
      filters.dateRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      }
    }

    const includeArchived = searchParams.get("includeArchived")
    if (includeArchived !== null) {
      filters.includeArchived = includeArchived === "true"
    }

    const data = await getDashboardOverview(filters)

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Dashboard overview error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard overview" }, { status: 500 })
  }
}
