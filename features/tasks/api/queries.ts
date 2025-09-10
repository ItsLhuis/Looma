import axios from "axios"

import { useQuery } from "@tanstack/react-query"

import type { GetTaskResponse, ListTasksRequest, ListTasksResponse } from "./types"

import type { Task } from "@/features/tasks/types"

const base = "/api/tasks"

export const tasksKeys = {
  all: [{ scope: "tasks" }] as const,
  lists: () => [{ ...tasksKeys.all[0], entity: "list" }] as const,
  list: (params: ListTasksRequest) => [{ ...tasksKeys.lists()[0], params }] as const,
  details: () => [{ ...tasksKeys.all[0], entity: "detail" }] as const,
  detail: (id: string) => [{ ...tasksKeys.details()[0], id }] as const,
  subtasks: (parentId: string) => [{ ...tasksKeys.all[0], entity: "subtasks", parentId }] as const
}

export function useListTasks(params: ListTasksRequest) {
  const url = new URL(base, globalThis.location?.origin ?? "http://localhost")

  if (params.limit != null) url.searchParams.set("limit", String(params.limit))
  if (params.offset != null) url.searchParams.set("offset", String(params.offset))
  if (params.orderBy?.column) url.searchParams.set("orderBy[column]", String(params.orderBy.column))
  if (params.orderBy?.direction)
    url.searchParams.set("orderBy[direction]", String(params.orderBy.direction))

  if (params.filters?.search) url.searchParams.set("filters[search]", String(params.filters.search))
  if (params.filters?.status) {
    if (Array.isArray(params.filters.status)) {
      params.filters.status.forEach((status) => {
        url.searchParams.append("filters[status][]", String(status))
      })
    } else {
      url.searchParams.set("filters[status]", String(params.filters.status))
    }
  }
  if (params.filters?.priority) {
    if (Array.isArray(params.filters.priority)) {
      params.filters.priority.forEach((priority) => {
        url.searchParams.append("filters[priority][]", String(priority))
      })
    } else {
      url.searchParams.set("filters[priority]", String(params.filters.priority))
    }
  }
  if (params.filters?.dueDate?.from) {
    url.searchParams.set("filters[dueDate][from]", params.filters.dueDate.from.toISOString())
  }
  if (params.filters?.dueDate?.to) {
    url.searchParams.set("filters[dueDate][to]", params.filters.dueDate.to.toISOString())
  }
  if (params.filters?.parentTaskId !== undefined) {
    url.searchParams.set("filters[parentTaskId]", String(params.filters.parentTaskId))
  }
  if (params.filters?.hasSubtasks !== undefined) {
    url.searchParams.set("filters[hasSubtasks]", String(params.filters.hasSubtasks))
  }

  return useQuery<ListTasksResponse>({
    queryKey: tasksKeys.list(params),
    queryFn: async () => {
      const res = await axios.get<ListTasksResponse>(url.toString(), { withCredentials: true })
      return res.data
    }
  })
}

export function useGetTask(id: string, enabled = true) {
  const url = `${base}/${id}`

  return useQuery<GetTaskResponse>({
    queryKey: tasksKeys.detail(id),
    queryFn: async () => {
      const res = await axios.get<GetTaskResponse>(url, { withCredentials: true })
      return res.data
    },
    enabled
  })
}

export function useGetSubtasks(parentId: string, enabled = true) {
  const url = `${base}/${parentId}/subtasks`

  return useQuery<{ data: Task[] }>({
    queryKey: tasksKeys.subtasks(parentId),
    queryFn: async () => {
      const res = await axios.get<{ data: Task[] }>(url, { withCredentials: true })
      return res.data
    },
    enabled
  })
}
