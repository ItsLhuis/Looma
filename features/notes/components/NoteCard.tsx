"use client"

import Link from "next/link"

import { cn } from "@/lib/utils"

import { formatDateForDisplay, toUTCDate } from "@/lib/date"

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

import type { Note, NotePriority } from "@/features/notes/types"

const getPriorityClasses = (priority: NotePriority) => {
  switch (priority) {
    case "urgent":
      return "bg-error text-error-foreground border border-error"
    case "high":
      return "bg-warning text-warning-foreground border border-warning"
    case "medium":
      return "bg-info text-info-foreground border border-info"
    case "low":
      return "bg-success text-success-foreground border border-success"
    default:
      return "bg-muted text-muted-foreground border border-muted"
  }
}

export type NoteCardProps = {
  note: Note
  className?: string
}

function NoteCard({ note, className }: NoteCardProps) {
  return (
    <Card className={cn("flex flex-col", className)} aria-label={`Note ${note.title}`}>
      <CardHeader className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <Typography variant="h5" className="line-clamp-2 leading-tight">
            {note.title}
          </Typography>
          <Typography affects={["muted", "small"]}>
            Updated at {formatDateForDisplay(toUTCDate(note.updatedAt.toString()))}
          </Typography>
        </div>
        <div className="flex max-w-full shrink-0 flex-col flex-wrap items-end gap-1.5 overflow-hidden">
          {note.priority !== "none" && (
            <Badge className={cn(getPriorityClasses(note.priority), "shrink-0 capitalize")}>
              {note.priority}
            </Badge>
          )}
          {note.isFavorite && (
            <Badge className="shrink-0">
              <Icon name="Star" isFilled /> Favorite
            </Badge>
          )}
          {note.isArchived && (
            <Badge variant="outline" className="shrink-0">
              <Icon name="Archive" />
              Archived
            </Badge>
          )}
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex h-full flex-col gap-6 wrap-break-word">
        {note.summary && (
          <Typography variant="blockquote" affects={["muted", "small"]} className="line-clamp-2">
            {note.summary?.trim()}
          </Typography>
        )}
        {note.content ? (
          <Typography affects={["muted", "small"]} className="line-clamp-4">
            {note.content?.trim()}
          </Typography>
        ) : (
          <Typography className="italic" affects={["muted", "small"]}>
            No content
          </Typography>
        )}
      </CardContent>
      <CardFooter className="flex items-end justify-end gap-2">
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

export { NoteCard }
