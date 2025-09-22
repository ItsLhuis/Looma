"use client"

import { cn } from "@/lib/utils"

import { useUpdateNote } from "@/features/notes/api/mutations"

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

import type { UpdateNoteToolInput } from "../schemas/note.schema"

type NoteUpdateConfirmationProps = {
  toolCallId: string
  input: UpdateNoteToolInput
  onApprove: (toolCallId: string, output: string) => void
  onReject: (toolCallId: string, output: string) => void
}

function NoteUpdateConfirmation({
  toolCallId,
  input,
  onApprove,
  onReject
}: NoteUpdateConfirmationProps) {
  const updateNoteMutation = useUpdateNote(input.id)

  const handleApprove = async () => {
    try {
      const updatedNote = await updateNoteMutation.mutateAsync({
        title: input.title,
        content: input.content,
        summary: input.summary,
        priority: input.priority,
        isFavorite: input.isFavorite,
        isArchived: input.isArchived
      })

      const result = {
        type: "NOTE_UPDATED",
        data: {
          id: updatedNote.data.id,
          title: updatedNote.data.title,
          content: updatedNote.data.content,
          summary: updatedNote.data.summary,
          priority: updatedNote.data.priority,
          isFavorite: updatedNote.data.isFavorite,
          isArchived: updatedNote.data.isArchived
        },
        message: `Note "${updatedNote.data.title}" has been successfully updated!`
      }

      onApprove(toolCallId, JSON.stringify(result))
    } catch (error) {
      const errorResult = {
        type: "ERROR",
        message: `Failed to update note: ${error instanceof Error ? error.message : "Unknown error"}`
      }
      onApprove(toolCallId, JSON.stringify(errorResult))
    }
  }

  const handleReject = async () => {
    const result = {
      type: "NOTE_UPDATE_CANCELLED",
      data: {
        id: input.id,
        title: input.title,
        content: input.content,
        summary: input.summary,
        priority: input.priority,
        isFavorite: input.isFavorite,
        isArchived: input.isArchived
      },
      message: "Note update was cancelled by user."
    }

    onReject(toolCallId, JSON.stringify(result))
  }

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

  return (
    <Card aria-label={`Update Note: ${input.title}`}>
      <CardHeader className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Icon name="Edit" className="h-5 w-5" />
            <Typography variant="h5" className="line-clamp-2 leading-tight">
              Update Note
            </Typography>
          </div>
          <Typography affects={["muted", "small"]}>Review the changes before updating</Typography>
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
      </CardContent>
      <Separator />
      <CardFooter className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleReject}
          disabled={updateNoteMutation.isPending}
          isLoading={updateNoteMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleApprove}
          disabled={updateNoteMutation.isPending}
          isLoading={updateNoteMutation.isPending}
        >
          Update
        </Button>
      </CardFooter>
    </Card>
  )
}

export { NoteUpdateConfirmation }
