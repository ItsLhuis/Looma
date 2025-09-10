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

import type { NoteFilters, NotePriority, OrderableNoteColumns } from "../types"

type OrderByColumn = OrderableNoteColumns
type OrderByDirection = "asc" | "desc"
type Priority = NotePriority

export type NotesFiltersParams = NoteFilters & {
  orderBy?: {
    column: OrderByColumn
    direction: OrderByDirection
  }
}

export type NotesFiltersParamsProps = {
  defaultFilters?: NotesFiltersParams
  onChange: (filters: NotesFiltersParams) => void
}

const priorityLabels: Record<Priority, string> = {
  none: "None",
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent"
}

const orderColumnLabels: Record<OrderByColumn, string> = {
  createdAt: "Created Date",
  updatedAt: "Last Updated",
  title: "Title",
  priority: "Priority",
  isFavorite: "Favorite",
  isArchived: "Archived"
}

const priorityColors: Record<Priority, string> = {
  none: "bg-muted text-muted-foreground border border-muted",
  low: "bg-success text-success-foreground border border-success",
  medium: "bg-info text-info-foreground border border-info",
  high: "bg-warning text-warning-foreground border border-warning",
  urgent: "bg-error text-error-foreground border border-error"
}

function NotesFilters({ defaultFilters = {}, onChange }: NotesFiltersParamsProps) {
  const [search, setSearch] = useQueryState("search", {
    defaultValue: defaultFilters.search ?? "",
    clearOnDefault: true
  })

  const [priority, setPriority] = useQueryState(
    "priority",
    parseAsStringEnum<Priority>(["none", "low", "medium", "high", "urgent"])
      .withDefault(defaultFilters.priority ?? "none")
      .withOptions({ clearOnDefault: true })
  )

  const [isFavorite, setIsFavorite] = useQueryState(
    "isFavorite",
    parseAsBoolean
      .withDefault(defaultFilters.isFavorite ?? false)
      .withOptions({ clearOnDefault: true })
  )

  const [isArchived, setIsArchived] = useQueryState(
    "isArchived",
    parseAsBoolean
      .withDefault(defaultFilters.isArchived ?? false)
      .withOptions({ clearOnDefault: true })
  )

  const [orderByColumn, setOrderByColumn] = useQueryState(
    "sortBy",
    parseAsStringEnum<OrderByColumn>([
      "createdAt",
      "updatedAt",
      "title",
      "priority",
      "isFavorite",
      "isArchived"
    ])
      .withDefault(defaultFilters.orderBy?.column ?? "createdAt")
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
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  )

  const debouncedOnChange = useMemo(
    () =>
      debounce((filters: NotesFiltersParams) => {
        onChange(filters)
      }, 300),
    [onChange]
  )

  useEffect(() => {
    const filters: NotesFiltersParams = {
      ...(search && { search }),
      ...(priority !== "none" && { priority }),
      ...(isFavorite && { isFavorite }),
      ...(isArchived && { isArchived }),
      orderBy: {
        column: orderByColumn,
        direction: orderByDirection
      }
    }

    debouncedOnChange(filters)
    return () => debouncedOnChange.cancel()
  }, [search, priority, isFavorite, isArchived, orderByColumn, orderByDirection, debouncedOnChange])

  const toggleSortDirection = () => {
    setOrderByDirection(orderByDirection === "asc" ? "desc" : "asc")
  }

  const clearAllFilters = () => {
    setSearch("")
    setPriority("none")
    setIsFavorite(false)
    setIsArchived(false)
    setOrderByColumn("createdAt")
    setOrderByDirection("desc")
  }

  const activeFiltersCount = [search, priority !== "none", isFavorite, isArchived].filter(
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
              placeholder="Search notes"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pl-10"
              aria-label="Search notes"
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
                      <Typography affects="small">Priority</Typography>
                    </Label>
                    <Select
                      value={priority}
                      onValueChange={(value) => setPriority(value as Priority)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
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
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <Icon name="Star" className="h-4 w-4 text-yellow-500" />
                        <Typography affects="small">Show favorites only</Typography>
                      </Label>
                      <Button
                        variant={isFavorite ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsFavorite(!isFavorite)}
                        className="h-8 px-3"
                      >
                        <Typography affects="small">{isFavorite ? "On" : "Off"}</Typography>
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <Icon name="Archive" className="text-muted-foreground h-4 w-4" />
                        <Typography affects="small">Show archived only</Typography>
                      </Label>
                      <Button
                        variant={isArchived ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsArchived(!isArchived)}
                        className="h-8 px-3"
                      >
                        <Typography affects="small">{isArchived ? "On" : "Off"}</Typography>
                      </Button>
                    </div>
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
            {priority !== "none" && (
              <Badge
                variant="secondary"
                className="group hover:bg-muted flex items-center gap-1.5 pr-1 transition-colors"
              >
                <div className={`h-2 w-2 rounded-full ${priorityColors[priority].split(" ")[0]}`} />
                <Typography affects="small">{priorityLabels[priority]}</Typography>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPriority("none")}
                  className="hover:bg-destructive hover:text-destructive-foreground h-4 w-4 p-0 opacity-60 group-hover:opacity-100"
                  title="Remove priority filter"
                >
                  <Icon name="X" className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {isFavorite && (
              <Badge
                variant="secondary"
                className="group hover:bg-muted flex items-center gap-1.5 pr-1 transition-colors"
              >
                <Icon name="Star" className="h-3 w-3 text-yellow-500" />
                <Typography affects="small">Favorites</Typography>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFavorite(false)}
                  className="hover:bg-destructive hover:text-destructive-foreground h-4 w-4 p-0 opacity-60 group-hover:opacity-100"
                  title="Remove favorites filter"
                >
                  <Icon name="X" className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {isArchived && (
              <Badge
                variant="secondary"
                className="group hover:bg-muted flex items-center gap-1.5 pr-1 transition-colors"
              >
                <Icon name="Archive" className="h-3 w-3" />
                <Typography affects="small">Archived</Typography>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsArchived(false)}
                  className="hover:bg-destructive hover:text-destructive-foreground h-4 w-4 p-0 opacity-60 group-hover:opacity-100"
                  title="Remove archived filter"
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

export { NotesFilters }
