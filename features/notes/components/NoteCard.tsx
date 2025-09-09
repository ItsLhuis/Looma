"use client"

import Link from "next/link"
import { useMemo } from "react"

import { cn } from "@/lib/utils"

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Icon,
  Separator,
  Typography
} from "@/components/ui"
import { DeleteNoteDialog } from "./DeleteNoteDialog"

import type { Note } from "@/features/notes/types"

export type NoteCardProps = {
  note: Note
  className?: string
}

export function NoteCard({ note, className }: NoteCardProps) {
  const preview = useMemo(() => {
    const source = note.summary?.trim() || note.content?.trim() || ""
    const condensed = source.replace(/\s+/g, " ")
    return condensed.length > 160 ? condensed.slice(0, 160) + "…" : condensed
  }, [note.summary, note.content])

  return (
    <Card className={cn("flex flex-col", className)} aria-label={`Note ${note.title}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="space-y-1">
          <Typography variant="h5" className="line-clamp-2 leading-tight">
            {note.title}
          </Typography>
          <Typography affects={["muted", "small"]}>
            Updated {new Date(note.updatedAt).toLocaleString()}
          </Typography>
        </div>
        <div className="flex items-center gap-2">
          {note.priority !== "none" ? <Badge variant="secondary">{note.priority}</Badge> : null}
          {note.isFavorite ? (
            <Badge>
              <Icon name="Star" isFilled /> Favorite
            </Badge>
          ) : null}
          {note.isArchived ? <Badge variant="outline">Archived</Badge> : null}
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        {preview ? (
          <Typography className="line-clamp-4" affects={["muted", "small"]}>
            {preview}
          </Typography>
        ) : (
          <Typography className="italic" affects={["muted", "small"]}>
            No content
          </Typography>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-end gap-2">
        <Button size="sm" variant="outline" asChild aria-label="Edit note">
          <Link href={`/notes/${note.id}`}>Edit</Link>
        </Button>
        <DeleteNoteDialog
          noteId={note.id}
          trigger={
            <Button size="sm" variant="destructive" aria-label="Delete note">
              Delete
            </Button>
          }
        />
      </CardFooter>
    </Card>
  )
}
