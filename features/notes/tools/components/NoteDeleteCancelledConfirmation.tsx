"use client"

import { Badge, Card, CardContent, CardHeader, Icon, Separator, Typography } from "@/components/ui"

import type { DeleteNoteToolInput } from "../schemas/note.schema"

type NoteDeleteCancelledConfirmationProps = {
  noteData: DeleteNoteToolInput
}

function NoteDeleteCancelledConfirmation({ noteData }: NoteDeleteCancelledConfirmationProps) {
  return (
    <Card
      className="border-error/20 bg-error/5 flex flex-col"
      aria-label={`Note Delete Cancelled: ${noteData.id}`}
    >
      <CardHeader className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Icon name="X" className="text-error h-5 w-5" />
            <Typography variant="h5" className="line-clamp-2 leading-tight">
              Note Delete Cancelled
            </Typography>
          </div>
          <Typography affects={["muted", "small"]}>Note deletion was cancelled</Typography>
        </div>
        <div className="flex max-w-full shrink-0 flex-col flex-wrap items-end gap-1.5 overflow-hidden">
          <Badge className="shrink-0">
            <Icon name="Shield" />
            Safe
          </Badge>
        </div>
      </CardHeader>
      <Separator className="bg-error/20" />
      <CardContent className="flex h-full flex-col gap-6 wrap-break-word">
        <Typography variant="blockquote" affects={["muted", "small"]} className="line-clamp-2">
          Note deletion was cancelled
        </Typography>
        <Typography affects={["muted", "small"]} className="line-clamp-4">
          The note has been kept safe and no changes were made to your collection.
        </Typography>
      </CardContent>
    </Card>
  )
}

export { NoteDeleteCancelledConfirmation }
