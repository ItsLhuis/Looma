export type DashboardStats = {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  overdueTasks: number
  totalNotes: number
  totalEvents: number
  todayEvents: number
  thisWeekEvents: number
  completionRate: number
}

export type TodaysFocus = {
  events: Array<{
    id: string
    title: string
    startTime: Date
    endTime?: Date
    isAllDay: boolean
  }>
  tasks: Array<{
    id: string
    title: string
    status: string
    priority: string
    dueDate?: Date
    isOverdue: boolean
  }>
  stats: {
    eventsCount: number
    tasksCount: number
    overdueCount: number
  }
}

export type WeeklyOverview = {
  events: Array<{
    id: string
    title: string
    startTime: Date
    endTime?: Date
    isAllDay: boolean
    dayOfWeek: string
  }>
  tasks: Array<{
    id: string
    title: string
    status: string
    priority: string
    dueDate?: Date
    dayOfWeek: string
  }>
  completionProgress: {
    completed: number
    total: number
    percentage: number
  }
}

export type RecentActivity = {
  notes: Array<{
    id: string
    title: string
    updatedAt: Date
    priority: string
  }>
  tasks: Array<{
    id: string
    title: string
    status: string
    updatedAt: Date
    completedAt?: Date
  }>
  events: Array<{
    id: string
    title: string
    startTime: Date
    updatedAt: Date
  }>
}

export type DashboardOverview = {
  stats: DashboardStats
  todaysFocus: TodaysFocus
  weeklyOverview: WeeklyOverview
  recentActivity: RecentActivity
}

export type PartialDashboardOverview = {
  stats?: DashboardStats
  todaysFocus?: TodaysFocus
  weeklyOverview?: WeeklyOverview
  recentActivity?: RecentActivity
}

export type DashboardFilters = {
  dateRange?: {
    start: Date
    end: Date
  }
  includeArchived?: boolean
}
