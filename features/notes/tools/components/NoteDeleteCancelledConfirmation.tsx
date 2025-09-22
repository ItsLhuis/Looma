"use client"

import { cn } from "@/lib/utils"

import { Badge, Card, CardContent, CardHeader, Icon, Separator, Typography } from "@/components/ui"

import {
  getActionStatusClasses,
  getActionStatusColor,
  getActionStatusIcon,
  getPriorityClasses
} from "@/features/notes/utils/status.utils"

import type { DeleteNoteToolInput } from "../schemas/note.schema"

type NoteDeleteCancelledConfirmationProps = {
  noteData: DeleteNoteToolInput
}

function NoteDeleteCancelledConfirmation({ noteData }: NoteDeleteCancelledConfirmationProps) {
  return (
    <Card
      className={cn("flex flex-col", getActionStatusClasses("cancelled"))}
      aria-label={`Note Delete Cancelled: ${noteData.id}`}
    >
      <CardHeader className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Icon
              name={getActionStatusIcon("cancelled")}
              className={cn("h-5 w-5", getActionStatusColor("cancelled"))}
            />
            <Typography variant="h5" className="line-clamp-2 leading-tight">
              Note Deletion Cancelled
            </Typography>
          </div>
          <Typography affects={["muted", "small"]}>Note deletion was cancelled by user</Typography>
        </div>
        <div className="flex max-w-full shrink-0 flex-col flex-wrap items-end gap-1.5 overflow-hidden">
          {noteData.priority && noteData.priority !== "none" && (
            <Badge className={cn(getPriorityClasses(noteData.priority), "shrink-0 capitalize")}>
              {noteData.priority}
            </Badge>
          )}
          {noteData.isFavorite && (
            <Badge className="shrink-0">
              <Icon name="Star" isFilled /> Favorite
            </Badge>
          )}
          {noteData.isArchived && (
            <Badge variant="outline" className="shrink-0">
              <Icon name="Archive" />
              Archived
            </Badge>
          )}
        </div>
      </CardHeader>
      <Separator className="bg-error/20" />
      <CardContent className="flex h-full flex-col gap-6 wrap-break-word">
        <Typography variant="h6" className="line-clamp-2 leading-tight">
          {noteData.title}
        </Typography>
        {noteData.summary && (
          <Typography variant="blockquote" affects={["muted", "small"]} className="line-clamp-2">
            {noteData.summary?.trim()}
          </Typography>
        )}
        {noteData.content ? (
          <Typography affects={["muted", "small"]} className="line-clamp-4">
            {noteData.content?.trim()}
          </Typography>
        ) : (
          <Typography className="italic" affects={["muted", "small"]}>
            No content
          </Typography>
        )}
        <div className="bg-error/10 border-error/20 rounded-md border p-3">
          <Typography affects={["muted", "small"]} className="text-center">
            This note was not deleted. You can ask me to delete it again if needed.
          </Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export { NoteDeleteCancelledConfirmation }
