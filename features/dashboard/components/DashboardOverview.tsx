import { Typography } from "@/components/ui"

import { RecentActivity } from "./RecentActivity"
import { StatsCards } from "./StatsCards"
import { TodaysFocus } from "./TodaysFocus"
import { WeeklyOverview } from "./WeeklyOverview"

import type { DashboardOverview as DashboardOverviewType, PartialDashboardOverview } from "../types"

type DashboardOverviewProps = {
  data?: DashboardOverviewType | PartialDashboardOverview
  isLoading?: boolean
  isError?: boolean
}

function DashboardOverview({ data, isLoading, isError }: DashboardOverviewProps) {
  if (isError) {
    return (
      <div className="flex h-full items-center justify-center py-6">
        <Typography className="text-destructive" affects={["small"]}>
          Failed to load dashboard
        </Typography>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <StatsCards stats={data?.stats} isLoading={isLoading} />
      <TodaysFocus data={data?.todaysFocus} isLoading={isLoading} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WeeklyOverview data={data?.weeklyOverview} isLoading={isLoading} />
        <RecentActivity data={data?.recentActivity} isLoading={isLoading} />
      </div>
    </div>
  )
}

export { DashboardOverview }
