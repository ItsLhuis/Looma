import axios from "axios"

import { useQuery } from "@tanstack/react-query"

import type { GetMemoryResponse, ListMemoriesRequest, ListMemoriesResponse } from "./types"

const base = "/api/memories"

export const memoriesKeys = {
  all: [{ scope: "memories" }] as const,
  lists: () => [{ ...memoriesKeys.all[0], entity: "list" }] as const,
  list: (params: ListMemoriesRequest) => [{ ...memoriesKeys.lists()[0], params }] as const,
  details: () => [{ ...memoriesKeys.all[0], entity: "detail" }] as const,
  detail: (id: string) => [{ ...memoriesKeys.details()[0], id }] as const
}

export function useListMemories(params: ListMemoriesRequest) {
  const url = new URL(base, globalThis.location?.origin ?? "http://localhost")

  if (params.limit != null) url.searchParams.set("limit", String(params.limit))
  if (params.offset != null) url.searchParams.set("offset", String(params.offset))
  if (params.orderBy?.column) url.searchParams.set("orderBy[column]", String(params.orderBy.column))
  if (params.orderBy?.direction)
    url.searchParams.set("orderBy[direction]", String(params.orderBy.direction))

  if (params.filters?.search) url.searchParams.set("filters[search]", String(params.filters.search))
  if (params.filters?.importance) {
    if (Array.isArray(params.filters.importance)) {
      params.filters.importance.forEach((importance) => {
        url.searchParams.append("filters[importance][]", String(importance))
      })
    } else {
      url.searchParams.set("filters[importance]", String(params.filters.importance))
    }
  }
  if (params.filters?.isActive !== undefined)
    url.searchParams.set("filters[isActive]", String(params.filters.isActive))

  return useQuery<ListMemoriesResponse>({
    queryKey: memoriesKeys.list(params),
    queryFn: async () => {
      const res = await axios.get<ListMemoriesResponse>(url.toString(), { withCredentials: true })
      return res.data
    }
  })
}

export function useGetMemory(id: string, enabled = true) {
  const url = `${base}/${id}`

  return useQuery<GetMemoryResponse>({
    queryKey: memoriesKeys.detail(id),
    queryFn: async () => {
      const res = await axios.get<GetMemoryResponse>(url, { withCredentials: true })
      return res.data
    },
    enabled
  })
}
