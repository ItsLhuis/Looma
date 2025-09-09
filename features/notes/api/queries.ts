import axios from "axios"

import { useQuery } from "@tanstack/react-query"

import type { GetNoteResponse, ListNotesRequest, ListNotesResponse } from "./types"

const base = "/api/notes"

export const notesKeys = {
  all: [{ scope: "notes" }] as const,
  lists: () => [{ ...notesKeys.all[0], entity: "list" }] as const,
  list: (params: ListNotesRequest) => [{ ...notesKeys.lists()[0], params }] as const,
  details: () => [{ ...notesKeys.all[0], entity: "detail" }] as const,
  detail: (id: string) => [{ ...notesKeys.details()[0], id }] as const
}

export function useListNotes(params: ListNotesRequest) {
  const url = new URL(base, globalThis.location?.origin ?? "http://localhost")

  if (params.limit != null) url.searchParams.set("limit", String(params.limit))
  if (params.offset != null) url.searchParams.set("offset", String(params.offset))
  if (params.orderBy?.column) url.searchParams.set("orderBy[column]", String(params.orderBy.column))
  if (params.orderBy?.direction)
    url.searchParams.set("orderBy[direction]", String(params.orderBy.direction))
  if (params.filters?.search) url.searchParams.set("filters[search]", String(params.filters.search))

  return useQuery<ListNotesResponse>({
    queryKey: notesKeys.list(params),
    queryFn: async () => {
      const res = await axios.get<ListNotesResponse>(url.toString(), { withCredentials: true })
      return res.data
    }
  })
}

export function useGetNote(id: string, enabled = true) {
  const url = `${base}/${id}`

  return useQuery<GetNoteResponse>({
    queryKey: notesKeys.detail(id),
    queryFn: async () => {
      const res = await axios.get<GetNoteResponse>(url, { withCredentials: true })
      return res.data
    },
    enabled
  })
}
