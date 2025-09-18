"use client"

import { useEffect, useMemo } from "react"

import { debounce } from "lodash"

import { parseAsArrayOf, parseAsBoolean, parseAsStringEnum, useQueryState } from "nuqs"

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

import type { MemoryFilters, MemoryImportance, OrderableMemoryColumns } from "../types"

type OrderByColumn = OrderableMemoryColumns
type OrderByDirection = "asc" | "desc"
type Importance = MemoryImportance

export type MemoriesFiltersParams = MemoryFilters & {
  orderBy?: {
    column: OrderByColumn
    direction: OrderByDirection
  }
}

export type MemoriesFiltersParamsProps = {
  defaultFilters?: MemoriesFiltersParams
  onChange: (filters: MemoriesFiltersParams) => void
}

const importanceLabels: Record<Importance, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical"
}

const orderColumnLabels: Record<OrderByColumn, string> = {
  createdAt: "Created Date",
  updatedAt: "Last Updated",
  title: "Title",
  importance: "Importance",
  isActive: "Active"
}

const importanceColors: Record<Importance, string> = {
  low: "bg-success text-success-foreground border border-success",
  medium: "bg-info text-info-foreground border border-info",
  high: "bg-warning text-warning-foreground border border-warning",
  critical: "bg-error text-error-foreground border border-error"
}

function MemoriesFilters({ defaultFilters = {}, onChange }: MemoriesFiltersParamsProps) {
  const [search, setSearch] = useQueryState("search", {
    defaultValue: defaultFilters.search ?? "",
    clearOnDefault: true
  })

  const [importance, setImportance] = useQueryState(
    "importance",
    parseAsArrayOf(parseAsStringEnum<Importance>(Object.keys(importanceLabels) as Importance[]))
      .withDefault(
        Array.isArray(defaultFilters.importance)
          ? defaultFilters.importance
          : defaultFilters.importance
            ? [defaultFilters.importance]
            : []
      )
      .withOptions({ clearOnDefault: true })
  )

  const [isActive, setIsActive] = useQueryState(
    "isActive",
    parseAsBoolean
      .withDefault(defaultFilters.isActive ?? false)
      .withOptions({ clearOnDefault: true })
  )

  const [orderByColumn, setOrderByColumn] = useQueryState(
    "sortBy",
    parseAsStringEnum<OrderByColumn>(["createdAt", "updatedAt", "title", "importance", "isActive"])
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
      debounce((filters: MemoriesFiltersParams) => {
        onChange(filters)
      }, 300),
    [onChange]
  )

  useEffect(() => {
    const filters: MemoriesFiltersParams = {
      ...(search && { search }),
      ...(importance.length > 0 && { importance }),
      ...(isActive && { isActive }),
      orderBy: {
        column: orderByColumn,
        direction: orderByDirection
      }
    }

    debouncedOnChange(filters)
    return () => debouncedOnChange.cancel()
  }, [search, importance, isActive, orderByColumn, orderByDirection, debouncedOnChange])

  const toggleSortDirection = () => {
    setOrderByDirection(orderByDirection === "asc" ? "desc" : "asc")
  }

  const clearAllFilters = () => {
    setSearch("")
    setImportance([])
    setIsActive(false)
    setOrderByColumn("createdAt")
    setOrderByDirection("desc")
  }

  const activeFiltersCount = [search, importance.length > 0, isActive].filter(Boolean).length

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
              placeholder="Search memories"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pl-10"
              aria-label="Search memories"
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
                      <Typography affects="small">Importance</Typography>
                    </Label>
                    <Select
                      value={importance.length > 0 ? importance[0] : "all"}
                      onValueChange={(value) =>
                        setImportance(value === "all" ? [] : [value as Importance])
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Importance Levels</SelectItem>
                        {Object.entries(importanceLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-2 w-2 rounded-full ${importanceColors[value as Importance].split(" ")[0]}`}
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
                        <Icon name="CheckCircle" className="h-4 w-4 text-green-500" />
                        <Typography affects="small">Show active only</Typography>
                      </Label>
                      <Button
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsActive(!isActive)}
                        className="h-8 px-3"
                      >
                        <Typography affects="small">{isActive ? "On" : "Off"}</Typography>
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
            {importance.map((i) => (
              <Badge
                key={i}
                variant="secondary"
                className="group hover:bg-muted flex items-center gap-1.5 pr-1 transition-colors"
              >
                <div className={`h-2 w-2 rounded-full ${importanceColors[i].split(" ")[0]}`} />
                <Typography affects="small">{importanceLabels[i]}</Typography>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setImportance(importance.filter((item) => item !== i))}
                  className="hover:bg-destructive hover:text-destructive-foreground h-4 w-4 p-0 opacity-60 group-hover:opacity-100"
                  title="Remove importance filter"
                >
                  <Icon name="X" className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            {isActive && (
              <Badge
                variant="secondary"
                className="group hover:bg-muted flex items-center gap-1.5 pr-1 transition-colors"
              >
                <Icon name="CheckCircle" className="h-3 w-3 text-green-500" />
                <Typography affects="small">Active</Typography>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsActive(false)}
                  className="hover:bg-destructive hover:text-destructive-foreground h-4 w-4 p-0 opacity-60 group-hover:opacity-100"
                  title="Remove active filter"
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

export { MemoriesFilters }
