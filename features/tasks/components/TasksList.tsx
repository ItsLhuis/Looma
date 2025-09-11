"use client"

import { useCallback, useState } from "react"

import { useListTasks } from "@/features/tasks/api"

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
import { TaskCard } from "./TaskCard"
import { TasksFilters, type TasksFiltersParams } from "./TasksFilters"

import { type QueryTasksParams } from "@/features/tasks/types"

export type TasksListProps = {
  initialParams?: QueryTasksParams
}

function TasksList({ initialParams }: TasksListProps) {
  const [params, setParams] = useState<QueryTasksParams>({
    limit: 20,
    offset: 0,
    ...initialParams
  })

  const { data, isLoading, isError, isFetching } = useListTasks(params)

  const onFiltersChange = useCallback(
    (filters: TasksFiltersParams) => {
      const newParams: QueryTasksParams = {
        limit: params.limit,
        offset: 0,
        orderBy: filters.orderBy,
        filters: {
          ...(filters.search && { search: filters.search }),
          ...(filters.status && { status: filters.status }),
          ...(filters.priority && { priority: filters.priority }),
          ...(filters.dueDate && { dueDate: filters.dueDate }),
          ...(filters.parentTaskId !== undefined && { parentTaskId: filters.parentTaskId }),
          ...(filters.hasSubtasks !== undefined && { hasSubtasks: filters.hasSubtasks })
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

  const defaultFilters: TasksFiltersParams = {
    search: params.filters?.search,
    status: params.filters?.status,
    priority: params.filters?.priority,
    orderBy: params.orderBy || { column: "updatedAt", direction: "desc" }
  }

  return (
    <div className="space-y-4">
      <div className="min-h-8">
        <Typography affects={["lead", "bold"]} className="shrink-0">
          {isFetching ? <Spinner /> : `${total} tasks`}
        </Typography>
      </div>
      <TasksFilters defaultFilters={defaultFilters} onChange={onFiltersChange} />
      {isLoading ? (
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
      ) : isError ? (
        <div className="flex h-full items-center justify-center py-6">
          <Typography className="text-destructive" affects={["small"]}>
            Failed to load tasks
          </Typography>
        </div>
      ) : data && data.data.length === 0 ? (
        <div className="flex h-full items-center justify-center py-6">
          <Typography affects={["muted", "small"]}>No tasks found</Typography>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data?.data.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
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

export { TasksList }
