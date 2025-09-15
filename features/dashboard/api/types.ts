import type { DashboardOverview, DashboardFilters } from "../types"

export type GetDashboardOverviewRequest = DashboardFilters

export type GetDashboardOverviewResponse = {
  data: DashboardOverview
}

export type GetTodaysFocusRequest = DashboardFilters

export type GetTodaysFocusResponse = {
  data: DashboardOverview["todaysFocus"]
}

export type GetWeeklyOverviewRequest = DashboardFilters

export type GetWeeklyOverviewResponse = {
  data: DashboardOverview["weeklyOverview"]
}

export type GetRecentActivityRequest = DashboardFilters

export type GetRecentActivityResponse = {
  data: DashboardOverview["recentActivity"]
}

export type GetDashboardStatsRequest = DashboardFilters

export type GetDashboardStatsResponse = {
  data: DashboardOverview["stats"]
}
