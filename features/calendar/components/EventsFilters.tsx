"use client"

import { useEffect, useMemo } from "react"

import { debounce } from "lodash"

import { parseAsBoolean, parseAsStringEnum, useQueryState } from "nuqs"

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

import type { EventFilters } from "../types"

type EventType = "all" | "allDay" | "timed"

export type EventsFiltersParamsProps = {
  defaultFilters?: EventFilters
  onChange: (filters: EventFilters) => void
}

const eventTypeLabels: Record<EventType, string> = {
  all: "All Events",
  allDay: "All-Day Events",
  timed: "Timed Events"
}

const timePeriodLabels = {
  allTime: "All Time",
  today: "Today",
  thisWeek: "This Week",
  thisMonth: "This Month",
  custom: "Custom Range"
}

function EventsFilters({ defaultFilters = {}, onChange }: EventsFiltersParamsProps) {
  const [search, setSearch] = useQueryState("search", {
    defaultValue: defaultFilters.search ?? "",
    clearOnDefault: true
  })

  const [eventType, setEventType] = useQueryState(
    "eventType",
    parseAsStringEnum<EventType>(["all", "allDay", "timed"])
      .withDefault("all")
      .withOptions({ clearOnDefault: true })
  )

  const [timePeriod, setTimePeriod] = useQueryState(
    "timePeriod",
    parseAsStringEnum<keyof typeof timePeriodLabels>([
      "allTime",
      "today",
      "thisWeek",
      "thisMonth",
      "custom"
    ])
      .withDefault("allTime")
      .withOptions({ clearOnDefault: true })
  )

  const [isFiltersOpen, setIsFiltersOpen] = useQueryState(
    "filtersOpen",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  )

  const debouncedOnChange = useMemo(
    () =>
      debounce((filters: EventFilters) => {
        onChange(filters)
      }, 300),
    [onChange]
  )

  const getDateRange = (period: string) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (period) {
      case "allTime":
        return undefined
      case "today":
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        }
      case "thisWeek":
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        endOfWeek.setHours(23, 59, 59, 999)
        return { start: startOfWeek, end: endOfWeek }
      case "thisMonth":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        endOfMonth.setHours(23, 59, 59, 999)
        return { start: startOfMonth, end: endOfMonth }
      default:
        return undefined
    }
  }

  useEffect(() => {
    const dateRange = getDateRange(timePeriod)
    const filters: EventFilters = {
      ...(search && { search }),
      ...(eventType !== "all" && { isAllDay: eventType === "allDay" }),
      ...(dateRange && { dateRange }),
      ...(defaultFilters.dateRange &&
        timePeriod === "custom" && { dateRange: defaultFilters.dateRange })
    }

    debouncedOnChange(filters)
    return () => debouncedOnChange.cancel()
  }, [search, eventType, timePeriod, debouncedOnChange, defaultFilters.dateRange])

  const clearAllFilters = () => {
    setSearch("")
    setEventType("all")
    setTimePeriod("allTime")
  }

  const activeFiltersCount = [search, eventType !== "all", timePeriod !== "allTime"].filter(
    Boolean
  ).length

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
              placeholder="Search events"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pl-10"
              aria-label="Search events"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
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
                      <Typography affects="small">Event Type</Typography>
                    </Label>
                    <Select
                      value={eventType}
                      onValueChange={(value) => setEventType(value as EventType)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(eventTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      <Typography affects="small">Time Period</Typography>
                    </Label>
                    <Select
                      value={timePeriod}
                      onValueChange={(value) =>
                        setTimePeriod(value as keyof typeof timePeriodLabels)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(timePeriodLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
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
            {eventType !== "all" && (
              <Badge
                variant="secondary"
                className="group hover:bg-muted flex items-center gap-1.5 pr-1 transition-colors"
              >
                <Icon name={eventType === "allDay" ? "Calendar" : "Clock"} className="h-3 w-3" />
                <Typography affects="small">{eventTypeLabels[eventType]}</Typography>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEventType("all")}
                  className="hover:bg-destructive hover:text-destructive-foreground h-4 w-4 p-0 opacity-60 group-hover:opacity-100"
                  title="Remove event type filter"
                >
                  <Icon name="X" className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {timePeriod !== "allTime" && (
              <Badge
                variant="secondary"
                className="group hover:bg-muted flex items-center gap-1.5 pr-1 transition-colors"
              >
                <Icon name="Calendar" className="h-3 w-3" />
                <Typography affects="small">{timePeriodLabels[timePeriod]}</Typography>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTimePeriod("allTime")}
                  className="hover:bg-destructive hover:text-destructive-foreground h-4 w-4 p-0 opacity-60 group-hover:opacity-100"
                  title="Remove time period filter"
                >
                  <Icon name="X" className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export { EventsFilters }
