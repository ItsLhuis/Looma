"use client"

import { useCallback, useState } from "react"

import { useCreateNote, useListNotes, useUpdateNote } from "@/features/notes/api"

import { type QueryNotesParams } from "@/features/notes/api/dal"

export function useNotes(initialParams: QueryNotesParams = { limit: 20, offset: 0 }) {
  const [params, setParams] = useState<QueryNotesParams>(initialParams)

  const list = useListNotes(params)

  const create = useCreateNote()
  const update = useUpdateNote("")

  const setSearch = useCallback(
    (search?: string) => setParams((p) => ({ ...p, offset: 0, filters: { search } })),
    []
  )
  const setPage = useCallback(
    (offset: number) => setParams((p) => ({ ...p, offset: Math.max(0, offset) })),
    []
  )

  return { list, create, update, setSearch, setPage, params, setParams }
}
