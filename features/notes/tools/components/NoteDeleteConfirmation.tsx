"use client"

import { useDeleteNote } from "@/features/notes/api/mutations"

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

import type { DeleteNoteToolInput } from "../schemas/note.schema"

type NoteDeleteConfirmationProps = {
  toolCallId: string
  input: DeleteNoteToolInput
  onApprove: (toolCallId: string, output: string) => void
  onReject: (toolCallId: string, output: string) => void
}

function NoteDeleteConfirmation({
  toolCallId,
  input,
  onApprove,
  onReject
}: NoteDeleteConfirmationProps) {
  const deleteNoteMutation = useDeleteNote(input.id)

  const handleApprove = async () => {
    try {
      const deletedNote = await deleteNoteMutation.mutateAsync()

      const result = {
        type: "NOTE_DELETED",
        data: {
          id: deletedNote.data.id,
          title: deletedNote.data.title
        },
        message: `Note "${deletedNote.data.title}" has been permanently deleted!`
      }

      onApprove(toolCallId, JSON.stringify(result))
    } catch (error) {
      const errorResult = {
        type: "ERROR",
        message: `Failed to delete note: ${error instanceof Error ? error.message : "Unknown error"}`
      }
      onApprove(toolCallId, JSON.stringify(errorResult))
    }
  }

  const handleReject = async () => {
    const result = {
      type: "NOTE_DELETE_CANCELLED",
      data: {
        id: input.id
      },
      message: "Note deletion was cancelled by user."
    }

    onReject(toolCallId, JSON.stringify(result))
  }

  return (
    <Card className="border-error/20 bg-error/5" aria-label={`Delete Note: ${input.id}`}>
      <CardHeader className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Icon name="Trash" className="text-error h-5 w-5" />
            <Typography variant="h5" className="text-error line-clamp-2 leading-tight">
              Delete Note
            </Typography>
          </div>
          <Typography affects={["muted", "small"]}>This action cannot be undone</Typography>
        </div>
        <div className="flex max-w-full shrink-0 flex-col flex-wrap items-end gap-1.5 overflow-hidden">
          <Badge variant="destructive" className="shrink-0">
            <Icon name="AlertTriangle" />
            Permanent
          </Badge>
        </div>
      </CardHeader>
      <Separator className="bg-error/20" />
      <CardContent className="flex h-full flex-col gap-6 wrap-break-word">
        <Typography variant="blockquote" affects={["muted", "small"]} className="line-clamp-2">
          Are you sure you want to delete this note?
        </Typography>
        <Typography affects={["muted", "small"]} className="line-clamp-4">
          This note will be permanently removed from your collection and cannot be recovered.
        </Typography>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleReject}
          disabled={deleteNoteMutation.isPending}
          isLoading={deleteNoteMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={handleApprove}
          disabled={deleteNoteMutation.isPending}
          isLoading={deleteNoteMutation.isPending}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}

export { NoteDeleteConfirmation }
