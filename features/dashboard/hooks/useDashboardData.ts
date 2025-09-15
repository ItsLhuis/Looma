import { useMemo } from "react"

import {
  useDashboardOverview,
  useDashboardStats,
  useTodaysFocus,
  useWeeklyOverview
} from "../api/queries"

import type { DashboardFilters, PartialDashboardOverview } from "../types"

export function useDashboardData(filters?: DashboardFilters) {
  const overviewQuery = useDashboardOverview(filters)
  const todayQuery = useTodaysFocus(filters)
  const weekQuery = useWeeklyOverview(filters)
  const statsQuery = useDashboardStats(filters)

  const isLoading =
    overviewQuery.isLoading || todayQuery.isLoading || weekQuery.isLoading || statsQuery.isLoading
  const isError =
    overviewQuery.isError || todayQuery.isError || weekQuery.isError || statsQuery.isError
  const error = overviewQuery.error || todayQuery.error || weekQuery.error || statsQuery.error

  const data = useMemo((): PartialDashboardOverview | undefined => {
    if (overviewQuery.data) {
      return overviewQuery.data.data
    }

    const fallbackData: PartialDashboardOverview = {
      stats: statsQuery.data?.data,
      todaysFocus: todayQuery.data?.data,
      weeklyOverview: weekQuery.data?.data,
      recentActivity: {
        notes: [],
        tasks: [],
        events: []
      }
    }

    if (statsQuery.data?.data || todayQuery.data?.data || weekQuery.data?.data) {
      return fallbackData
    }

    return undefined
  }, [overviewQuery.data, statsQuery.data, todayQuery.data, weekQuery.data])

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: () => {
      overviewQuery.refetch()
      todayQuery.refetch()
      weekQuery.refetch()
      statsQuery.refetch()
    }
  }
}

export function useDashboardStatsData(filters?: DashboardFilters) {
  return useDashboardStats(filters)
}

export function useTodaysFocusData(filters?: DashboardFilters) {
  return useTodaysFocus(filters)
}

export function useWeeklyOverviewData(filters?: DashboardFilters) {
  return useWeeklyOverview(filters)
}
