"use client"

import { cn } from "@/lib/utils"

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

  const getPriorityClasses = (priority: string) => {
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

  const handleApprove = async () => {
    try {
      const deletedNote = await deleteNoteMutation.mutateAsync()

      const result = {
        type: "NOTE_DELETED",
        data: {
          id: deletedNote.data.id,
          title: deletedNote.data.title,
          content: deletedNote.data.content,
          summary: deletedNote.data.summary,
          priority: deletedNote.data.priority,
          isFavorite: deletedNote.data.isFavorite,
          isArchived: deletedNote.data.isArchived
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
    <Card aria-label={`Delete Note: ${input.title}`}>
      <CardHeader className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Icon name="Trash" className="h-5 w-5" />
            <Typography variant="h5" className="line-clamp-2 leading-tight">
              Delete Note
            </Typography>
          </div>
          <Typography affects={["muted", "small"]}>This action cannot be undone</Typography>
        </div>
        <div className="flex max-w-full shrink-0 flex-col flex-wrap items-end gap-1.5 overflow-hidden">
          {input.priority && input.priority !== "none" && (
            <Badge className={cn(getPriorityClasses(input.priority), "shrink-0 capitalize")}>
              {input.priority}
            </Badge>
          )}
          {input.isFavorite && (
            <Badge className="shrink-0">
              <Icon name="Star" isFilled /> Favorite
            </Badge>
          )}
          {input.isArchived && (
            <Badge variant="outline" className="shrink-0">
              <Icon name="Archive" />
              Archived
            </Badge>
          )}
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex h-full flex-col gap-6 wrap-break-word">
        <Typography variant="h6" className="line-clamp-2 leading-tight">
          {input.title}
        </Typography>
        {input.summary && (
          <Typography variant="blockquote" affects={["muted", "small"]} className="line-clamp-2">
            {input.summary?.trim()}
          </Typography>
        )}
        {input.content ? (
          <Typography affects={["muted", "small"]} className="line-clamp-4">
            {input.content?.trim()}
          </Typography>
        ) : (
          <Typography className="italic" affects={["muted", "small"]}>
            No content
          </Typography>
        )}
        <div className="bg-destructive/10 border-destructive/20 rounded-md border p-3">
          <Typography affects={["muted", "small"]} className="text-center">
            Are you sure you want to delete this note? This action cannot be undone.
          </Typography>
        </div>
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
