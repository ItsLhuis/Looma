"use client"

import { Badge, Card, CardContent, CardHeader, Icon, Separator, Typography } from "@/components/ui"

import type { DeleteNoteToolInput } from "../schemas/note.schema"

type NoteDeletedConfirmationProps = {
  noteData: DeleteNoteToolInput
}

function NoteDeletedConfirmation({ noteData }: NoteDeletedConfirmationProps) {
  return (
    <Card
      className="border-success/20 bg-success/5 flex flex-col"
      aria-label={`Note Deleted: ${noteData.id}`}
    >
      <CardHeader className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Icon name="Check" className="text-success h-5 w-5" />
            <Typography variant="h5" className="line-clamp-2 leading-tight">
              Note Deleted Successfully
            </Typography>
          </div>
          <Typography affects={["muted", "small"]}>Note has been permanently removed</Typography>
        </div>
        <div className="flex max-w-full shrink-0 flex-col flex-wrap items-end gap-1.5 overflow-hidden">
          <Badge className="shrink-0">
            <Icon name="Trash" />
            Deleted
          </Badge>
        </div>
      </CardHeader>
      <Separator className="bg-success/20" />
      <CardContent className="flex h-full flex-col gap-6 wrap-break-word">
        <Typography variant="blockquote" affects={["muted", "small"]} className="line-clamp-2">
          Note has been permanently removed
        </Typography>
        <Typography affects={["muted", "small"]} className="line-clamp-4">
          The note has been successfully deleted from your collection and cannot be recovered.
        </Typography>
      </CardContent>
    </Card>
  )
}

export { NoteDeletedConfirmation }
