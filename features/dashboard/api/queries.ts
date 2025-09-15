import axios from "axios"

import { useQuery } from "@tanstack/react-query"

import type {
  GetDashboardOverviewRequest,
  GetDashboardOverviewResponse,
  GetDashboardStatsRequest,
  GetDashboardStatsResponse,
  GetTodaysFocusRequest,
  GetTodaysFocusResponse,
  GetWeeklyOverviewRequest,
  GetWeeklyOverviewResponse
} from "./types"

export const dashboardKeys = {
  all: [{ scope: "dashboard" }] as const,
  overview: (params?: GetDashboardOverviewRequest) =>
    [{ ...dashboardKeys.all[0], entity: "overview", params }] as const,
  today: (params?: GetTodaysFocusRequest) =>
    [{ ...dashboardKeys.all[0], entity: "today", params }] as const,
  week: (params?: GetWeeklyOverviewRequest) =>
    [{ ...dashboardKeys.all[0], entity: "week", params }] as const,
  stats: (params?: GetDashboardStatsRequest) =>
    [{ ...dashboardKeys.all[0], entity: "stats", params }] as const
}

export function useDashboardOverview(params?: GetDashboardOverviewRequest) {
  const url = new URL("/api/dashboard/overview", globalThis.location?.origin ?? "http://localhost")

  if (params?.dateRange?.start) {
    url.searchParams.set("dateRange[start]", params.dateRange.start.toISOString())
  }
  if (params?.dateRange?.end) {
    url.searchParams.set("dateRange[end]", params.dateRange.end.toISOString())
  }
  if (params?.includeArchived !== undefined) {
    url.searchParams.set("includeArchived", String(params.includeArchived))
  }

  return useQuery<GetDashboardOverviewResponse>({
    queryKey: dashboardKeys.overview(params),
    queryFn: async () => {
      const res = await axios.get<GetDashboardOverviewResponse>(url.toString(), {
        withCredentials: true
      })
      return res.data
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true
  })
}

export function useTodaysFocus(params?: GetTodaysFocusRequest) {
  const url = new URL("/api/dashboard/today", globalThis.location?.origin ?? "http://localhost")

  if (params?.dateRange?.start) {
    url.searchParams.set("dateRange[start]", params.dateRange.start.toISOString())
  }
  if (params?.dateRange?.end) {
    url.searchParams.set("dateRange[end]", params.dateRange.end.toISOString())
  }
  if (params?.includeArchived !== undefined) {
    url.searchParams.set("includeArchived", String(params.includeArchived))
  }

  return useQuery<GetTodaysFocusResponse>({
    queryKey: dashboardKeys.today(params),
    queryFn: async () => {
      const res = await axios.get<GetTodaysFocusResponse>(url.toString(), { withCredentials: true })
      return res.data
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true
  })
}

export function useWeeklyOverview(params?: GetWeeklyOverviewRequest) {
  const url = new URL("/api/dashboard/week", globalThis.location?.origin ?? "http://localhost")

  if (params?.dateRange?.start) {
    url.searchParams.set("dateRange[start]", params.dateRange.start.toISOString())
  }
  if (params?.dateRange?.end) {
    url.searchParams.set("dateRange[end]", params.dateRange.end.toISOString())
  }
  if (params?.includeArchived !== undefined) {
    url.searchParams.set("includeArchived", String(params.includeArchived))
  }

  return useQuery<GetWeeklyOverviewResponse>({
    queryKey: dashboardKeys.week(params),
    queryFn: async () => {
      const res = await axios.get<GetWeeklyOverviewResponse>(url.toString(), {
        withCredentials: true
      })
      return res.data
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true
  })
}

export function useDashboardStats(params?: GetDashboardStatsRequest) {
  const url = new URL("/api/dashboard/stats", globalThis.location?.origin ?? "http://localhost")

  if (params?.dateRange?.start) {
    url.searchParams.set("dateRange[start]", params.dateRange.start.toISOString())
  }
  if (params?.dateRange?.end) {
    url.searchParams.set("dateRange[end]", params.dateRange.end.toISOString())
  }
  if (params?.includeArchived !== undefined) {
    url.searchParams.set("includeArchived", String(params.includeArchived))
  }

  return useQuery<GetDashboardStatsResponse>({
    queryKey: dashboardKeys.stats(params),
    queryFn: async () => {
      const res = await axios.get<GetDashboardStatsResponse>(url.toString(), {
        withCredentials: true
      })
      return res.data
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true
  })
}
