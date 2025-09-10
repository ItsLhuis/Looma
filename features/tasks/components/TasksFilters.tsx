"use client"

import { useEffect, useMemo } from "react"

import { debounce } from "lodash"

import { parseAsArrayOf, parseAsStringEnum, useQueryState } from "nuqs"

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Icon,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Typography
} from "@/components/ui"

import type { OrderableTaskColumns, TaskFilters, TaskPriority, TaskStatus } from "../types"

type OrderByColumn = OrderableTaskColumns
type OrderByDirection = "asc" | "desc"
type Priority = TaskPriority
type Status = TaskStatus

export type TasksFiltersParams = TaskFilters & {
  orderBy?: {
    column: OrderByColumn
    direction: OrderByDirection
  }
}

export type TasksFiltersParamsProps = {
  defaultFilters?: TasksFiltersParams
  onChange: (filters: TasksFiltersParams) => void
}

const priorityLabels: Record<Priority, string> = {
  none: "None",
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent"
}

const statusLabels: Record<Status, string> = {
  pending: "Pending",
  inProgress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  onHold: "On Hold"
}

const orderColumnLabels: Record<OrderByColumn, string> = {
  createdAt: "Created Date",
  updatedAt: "Last Updated",
  title: "Title",
  status: "Status",
  priority: "Priority",
  dueDate: "Due Date",
  position: "Position"
}

const priorityColors: Record<Priority, string> = {
  none: "bg-muted text-muted-foreground border border-muted",
  low: "bg-success text-success-foreground border border-success",
  medium: "bg-info text-info-foreground border border-info",
  high: "bg-warning text-warning-foreground border border-warning",
  urgent: "bg-error text-error-foreground border border-error"
}

const statusColors: Record<Status, string> = {
  pending: "bg-muted text-muted-foreground border border-muted",
  inProgress: "bg-info text-info-foreground border border-info",
  completed: "bg-success text-success-foreground border border-success",
  cancelled: "bg-error text-error-foreground border border-error",
  onHold: "bg-warning text-warning-foreground border border-warning"
}

function TasksFilters({ defaultFilters = {}, onChange }: TasksFiltersParamsProps) {
  const [search, setSearch] = useQueryState("search", {
    defaultValue: defaultFilters.search ?? "",
    clearOnDefault: true
  })

  const [status, setStatus] = useQueryState(
    "status",
    parseAsArrayOf(parseAsStringEnum<Status>(Object.keys(statusLabels) as Status[]))
      .withDefault(
        Array.isArray(defaultFilters.status)
          ? defaultFilters.status
          : defaultFilters.status
            ? [defaultFilters.status]
            : []
      )
      .withOptions({ clearOnDefault: true })
  )

  const [priority, setPriority] = useQueryState(
    "priority",
    parseAsArrayOf(parseAsStringEnum<Priority>(Object.keys(priorityLabels) as Priority[]))
      .withDefault(
        Array.isArray(defaultFilters.priority)
          ? defaultFilters.priority
          : defaultFilters.priority
            ? [defaultFilters.priority]
            : []
      )
      .withOptions({ clearOnDefault: true })
  )

  const [orderByColumn, setOrderByColumn] = useQueryState(
    "sortBy",
    parseAsStringEnum<OrderByColumn>([
      "createdAt",
      "updatedAt",
      "title",
      "status",
      "priority",
      "dueDate",
      "position"
    ])
      .withDefault(defaultFilters.orderBy?.column ?? "updatedAt")
      .withOptions({ clearOnDefault: true })
  )

  const [orderByDirection, setOrderByDirection] = useQueryState(
    "sortOrder",
    parseAsStringEnum<OrderByDirection>(["asc", "desc"])
      .withDefault(defaultFilters.orderBy?.direction ?? "desc")
      .withOptions({ clearOnDefault: true })
  )

  const [isFiltersOpen, setIsFiltersOpen] = useQueryState(
    "filtersOpen",
    parseAsStringEnum(["true", "false"]).withDefault("false").withOptions({ clearOnDefault: true })
  )

  const debouncedOnChange = useMemo(
    () =>
      debounce((filters: TasksFiltersParams) => {
        onChange(filters)
      }, 300),
    [onChange]
  )

  useEffect(() => {
    const filters: TasksFiltersParams = {
      ...(search && { search }),
      ...(status.length > 0 && { status }),
      ...(priority.length > 0 && { priority }),
      orderBy: {
        column: orderByColumn,
        direction: orderByDirection
      }
    }

    debouncedOnChange(filters)
    return () => debouncedOnChange.cancel()
  }, [search, status, priority, orderByColumn, orderByDirection, debouncedOnChange])

  const toggleSortDirection = () => {
    setOrderByDirection(orderByDirection === "asc" ? "desc" : "asc")
  }

  const clearAllFilters = () => {
    setSearch("")
    setStatus([])
    setPriority([])
    setOrderByColumn("updatedAt")
    setOrderByDirection("desc")
  }

  const activeFiltersCount = [search, status.length > 0, priority.length > 0].filter(Boolean).length

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <div className="relative">
            <Icon
              name="Search"
              className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
            />
            <Input
              type="search"
              placeholder="Search tasks"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pl-10"
              aria-label="Search tasks"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-full items-center gap-1 rounded-lg border p-1">
            <Select
              value={orderByColumn}
              onValueChange={(value) => setOrderByColumn(value as OrderByColumn)}
            >
              <SelectTrigger className="w-full border-0 focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(orderColumnLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSortDirection}
              className="hover:bg-muted h-8 w-8 p-0"
              title={`Sort ${orderByDirection === "asc" ? "descending" : "ascending"}`}
            >
              {orderByDirection === "asc" ? (
                <Icon name="ArrowUp" className="h-4 w-4" />
              ) : (
                <Icon name="ArrowDown" className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Popover
            open={isFiltersOpen === "true"}
            onOpenChange={(open) => setIsFiltersOpen(open ? "true" : "false")}
          >
            <PopoverTrigger asChild>
              <Button variant="outline" size="lg" className="relative h-12 gap-2">
                <Icon name="Filter" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="h-5 min-w-5 rounded-full px-1.5">
                    <Typography affects="small">{activeFiltersCount}</Typography>
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <Card className="border-none">
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>
                    <Typography variant="h4">Filters</Typography>
                  </CardTitle>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-muted-foreground h-8"
                    >
                      <Icon name="X" className="h-3 w-3" />
                      <Typography affects="small">Clear all</Typography>
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      <Typography affects="small">Status</Typography>
                    </Label>
                    <Select
                      value={status.length > 0 ? status[0] : "all"}
                      onValueChange={(value) => setStatus(value === "all" ? [] : [value as Status])}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-2 w-2 rounded-full ${statusColors[value as Status].split(" ")[0]}`}
                              />
                              {label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      <Typography affects="small">Priority</Typography>
                    </Label>
                    <Select
                      value={priority.length > 0 ? priority[0] : "all"}
                      onValueChange={(value) =>
                        setPriority(value === "all" ? [] : [value as Priority])
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        {Object.entries(priorityLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-2 w-2 rounded-full ${priorityColors[value as Priority].split(" ")[0]}`}
                              />
                              {label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {activeFiltersCount > 0 && (
        <div className="flex flex-col justify-center gap-3">
          <div className="flex items-center justify-between">
            <Typography affects={["small", "muted"]}>Active filters</Typography>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground"
            >
              <Icon name="X" className="h-3 w-3" />
              <Typography affects="small">Clear all</Typography>
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {search && (
              <Badge
                variant="secondary"
                className="group hover:bg-muted flex items-center gap-1.5 pr-1 transition-colors"
              >
                <Icon name="Search" className="h-3 w-3" />
                <Typography affects="small" className="max-w-32 truncate">
                  {search}
                </Typography>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearch("")}
                  className="hover:bg-destructive hover:text-destructive-foreground h-4 w-4 p-0 opacity-60 group-hover:opacity-100"
                  title="Remove search filter"
                >
                  <Icon name="X" className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {status.map((s) => (
              <Badge
                key={s}
                variant="secondary"
                className="group hover:bg-muted flex items-center gap-1.5 pr-1 transition-colors"
              >
                <div className={`h-2 w-2 rounded-full ${statusColors[s].split(" ")[0]}`} />
                <Typography affects="small">{statusLabels[s]}</Typography>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStatus(status.filter((item) => item !== s))}
                  className="hover:bg-destructive hover:text-destructive-foreground h-4 w-4 p-0 opacity-60 group-hover:opacity-100"
                  title="Remove status filter"
                >
                  <Icon name="X" className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            {priority.map((p) => (
              <Badge
                key={p}
                variant="secondary"
                className="group hover:bg-muted flex items-center gap-1.5 pr-1 transition-colors"
              >
                <div className={`h-2 w-2 rounded-full ${priorityColors[p].split(" ")[0]}`} />
                <Typography affects="small">{priorityLabels[p]}</Typography>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPriority(priority.filter((item) => item !== p))}
                  className="hover:bg-destructive hover:text-destructive-foreground h-4 w-4 p-0 opacity-60 group-hover:opacity-100"
                  title="Remove priority filter"
                >
                  <Icon name="X" className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { TasksFilters }
