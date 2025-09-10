"use client"

import { useCallback, useState } from "react"

import { useCreateTask, useListTasks, useUpdateTask } from "@/features/tasks/api"

import { type QueryTasksParams } from "@/features/tasks/types"

export function useTasks(initialParams: QueryTasksParams = { limit: 20, offset: 0 }) {
  const [params, setParams] = useState<QueryTasksParams>(initialParams)

  const list = useListTasks(params)

  const create = useCreateTask()
  const update = useUpdateTask("")

  const setSearch = useCallback(
    (search?: string) => setParams((p) => ({ ...p, offset: 0, filters: { ...p.filters, search } })),
    []
  )
  const setPage = useCallback(
    (offset: number) => setParams((p) => ({ ...p, offset: Math.max(0, offset) })),
    []
  )

  const setFilters = useCallback(
    (filters: QueryTasksParams["filters"]) => setParams((p) => ({ ...p, offset: 0, filters })),
    []
  )

  const clearFilters = useCallback(() => {
    setParams((p) => ({ ...p, offset: 0, filters: undefined }))
  }, [])

  return { list, create, update, setSearch, setPage, setFilters, clearFilters, params, setParams }
}
