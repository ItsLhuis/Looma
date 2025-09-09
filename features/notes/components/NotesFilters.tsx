"use client"

import { useEffect, useState } from "react"

import { Input } from "@/components/ui"

export type NotesFiltersProps = {
  defaultSearch?: string
  onChange: (filters: { search?: string }) => void
}

export function NotesFilters({ defaultSearch, onChange }: NotesFiltersProps) {
  const [search, setSearch] = useState(defaultSearch ?? "")

  const debounced = useDebounced(search, 350)
  useEffect(() => {
    onChange({ search: debounced || undefined })
  }, [debounced, onChange])

  return (
    <Input
      placeholder="Search notes"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      aria-label="Search notes"
      className="w-full"
    />
  )
}

function useDebounced<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(id)
  }, [value, delayMs])
  return debounced
}
