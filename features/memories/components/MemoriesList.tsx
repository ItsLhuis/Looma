"use client"

import { useCallback, useState } from "react"

import { useListMemories } from "@/features/memories/api"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Separator,
  Skeleton,
  Spinner,
  Typography
} from "@/components/ui"
import { MemoryCard } from "./MemoryCard"
import { MemoriesFilters, type MemoriesFiltersParams } from "./MemoriesFilters"

import type { QueryMemoriesParams } from "@/features/memories/types"

export type MemoriesListProps = {
  initialParams?: QueryMemoriesParams
}

function MemoriesList({ initialParams }: MemoriesListProps) {
  const [params, setParams] = useState<QueryMemoriesParams>({
    limit: 20,
    offset: 0,
    ...initialParams
  })

  const { data, isLoading, isError, isFetching } = useListMemories(params)

  const onFiltersChange = useCallback(
    (filters: MemoriesFiltersParams) => {
      const newParams: QueryMemoriesParams = {
        limit: params.limit,
        offset: 0,
        orderBy: filters.orderBy,
        filters: {
          ...(filters.search && { search: filters.search }),
          ...(filters.importance &&
            filters.importance !== "medium" && { importance: filters.importance }),
          ...(filters.isActive !== undefined && { isActive: filters.isActive })
        }
      }

      setParams(newParams)
    },
    [params.limit]
  )

  const total = data?.total ?? 0
  const limit = params.limit ?? 20
  const currentOffset = params.offset ?? 0
  const currentPage = Math.floor(currentOffset / limit) + 1
  const totalPages = Math.ceil(total / limit)

  const goToPage = (page: number) => {
    const newOffset = (page - 1) * limit
    setParams((prevParams) => ({ ...prevParams, offset: newOffset }))
  }

  const canPrev = currentPage > 1
  const canNext = currentPage < totalPages

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...")
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots.filter((item, index, arr) => arr.indexOf(item) === index)
  }

  const defaultFilters: MemoriesFiltersParams = {
    search: params.filters?.search,
    orderBy: params.orderBy || { column: "createdAt", direction: "desc" }
  }

  const headerContent = (
    <div className="min-h-8">
      <Typography affects={["lead", "bold"]} className="shrink-0">
        {isFetching ? <Spinner /> : `${total} memories`}
      </Typography>
    </div>
  )

  const filtersContent = (
    <MemoriesFilters defaultFilters={defaultFilters} onChange={onFiltersChange} />
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        {headerContent}
        {filtersContent}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 12 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex justify-between">
                <Skeleton className="h-12 w-40" />
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
              <CardFooter className="w-full justify-end gap-3">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-4">
        {headerContent}
        {filtersContent}
        <div className="flex h-full items-center justify-center py-6">
          <Typography className="text-destructive" affects={["small"]}>
            Failed to load memories
          </Typography>
        </div>
      </div>
    )
  }

  if (data && data.data.length === 0) {
    return (
      <div className="space-y-4">
        {headerContent}
        {filtersContent}
        <div className="flex h-full items-center justify-center py-6">
          <Typography affects={["muted", "small"]}>No memories found</Typography>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {headerContent}
      {filtersContent}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data?.data.map((memory) => (
          <MemoryCard key={memory.id} memory={memory} />
        ))}
      </div>
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => canPrev && goToPage(currentPage - 1)}
                className={!canPrev ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {getVisiblePages().map((page, index) => (
              <PaginationItem key={index}>
                {page === "..." ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    onClick={() => goToPage(page as number)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => canNext && goToPage(currentPage + 1)}
                className={!canNext ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

export { MemoriesList }
