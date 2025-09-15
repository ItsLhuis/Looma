import { NextRequest, NextResponse } from "next/server"

import { getTodaysFocus } from "@/features/dashboard/api/dal"

import type { GetTodaysFocusRequest } from "@/features/dashboard/api/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters: GetTodaysFocusRequest = {}

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

    const data = await getTodaysFocus(filters)

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Today's focus error:", error)
    return NextResponse.json({ error: "Failed to fetch today's focus" }, { status: 500 })
  }
}
