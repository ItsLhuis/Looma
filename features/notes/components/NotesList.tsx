"use client"

import { useCallback, useState } from "react"

import { useListNotes } from "@/features/notes/api"

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Skeleton,
  Spinner,
  Typography
} from "@/components/ui"
import { NoteCard } from "./NoteCard"
import { NotesFilters } from "./NotesFilters"

// Note type not needed in this component anymore

import { type QueryNotesParams } from "@/features/notes/api/dal"

export type NotesListProps = {
  initialParams?: QueryNotesParams
}

export function NotesList({ initialParams }: NotesListProps) {
  const [params, setParams] = useState<QueryNotesParams>({ limit: 20, offset: 0, ...initialParams })

  const { data, isLoading, isError, isFetching } = useListNotes(params)

  const onFiltersChange = useCallback((filters: NonNullable<QueryNotesParams["filters"]>) => {
    setParams((prevParams) => ({ ...prevParams, offset: 0, filters }))
  }, [])

  const total = data?.total ?? 0

  const canPrev = (params.offset ?? 0) > 0
  const canNext = (params.offset ?? 0) + (params.limit ?? 20) < total

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <NotesFilters defaultSearch={params.filters?.search} onChange={onFiltersChange} />
        <Typography affects={["muted", "small"]} className="shrink-0">
          {isFetching ? <Spinner className="size-4" /> : `${total} notes`}
        </Typography>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Typography className="text-destructive" affects={["small"]}>
          Failed to load notes.
        </Typography>
      ) : data && data.data.length === 0 ? (
        <Typography affects={["muted", "small"]}>No notes found.</Typography>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data?.data.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          disabled={!canPrev}
          onClick={() =>
            setParams((prevParams) => ({
              ...prevParams,
              offset: Math.max(0, (prevParams.offset ?? 0) - (prevParams.limit ?? 20))
            }))
          }
        >
          Previous
        </Button>
        <Button
          variant="outline"
          disabled={!canNext}
          onClick={() =>
            setParams((prevParams) => ({
              ...prevParams,
              offset: (prevParams.offset ?? 0) + (prevParams.limit ?? 20)
            }))
          }
        >
          Next
        </Button>
      </div>
    </div>
  )
}
