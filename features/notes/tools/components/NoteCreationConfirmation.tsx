"use client"

import { cn } from "@/lib/utils"

import { useCreateNote } from "@/features/notes/api/mutations"

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

import type { CreateNoteToolInput } from "../schemas/note.schema"

type NoteCreationConfirmationProps = {
  toolCallId: string
  input: CreateNoteToolInput
  onApprove: (toolCallId: string, output: string) => void
  onReject: (toolCallId: string, output: string) => void
}

function NoteCreationConfirmation({
  toolCallId,
  input,
  onApprove,
  onReject
}: NoteCreationConfirmationProps) {
  const createNoteMutation = useCreateNote()

  const handleApprove = async () => {
    try {
      const createdNote = await createNoteMutation.mutateAsync({
        title: input.title,
        content: input.content,
        summary: input.summary,
        priority: input.priority,
        isFavorite: input.isFavorite,
        isArchived: input.isArchived
      })

      const result = {
        type: "NOTE_CREATED",
        data: {
          id: createdNote.data.id,
          title: createdNote.data.title,
          content: createdNote.data.content,
          summary: createdNote.data.summary,
          priority: createdNote.data.priority,
          isFavorite: createdNote.data.isFavorite,
          isArchived: createdNote.data.isArchived
        },
        message: `Note "${createdNote.data.title}" has been successfully created!`
      }

      onApprove(toolCallId, JSON.stringify(result))
    } catch (error) {
      const errorResult = {
        type: "ERROR",
        message: `Failed to create note: ${error instanceof Error ? error.message : "Unknown error"}`
      }
      onApprove(toolCallId, JSON.stringify(errorResult))
    }
  }

  const handleReject = async () => {
    const result = {
      type: "NOTE_CANCELLED",
      data: {
        title: input.title,
        content: input.content,
        summary: input.summary,
        priority: input.priority,
        isFavorite: input.isFavorite,
        isArchived: input.isArchived
      },
      message: "Note creation was cancelled by user."
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
    <Card aria-label={`Create Note: ${input.title}`}>
      <CardHeader className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Icon name="Notebook" />
            <Typography variant="h5" className="line-clamp-2 leading-tight">
              Create Note
            </Typography>
          </div>
          <Typography affects={["muted", "small"]}>Review the details before creating</Typography>
        </div>
        <div className="flex max-w-full shrink-0 flex-col flex-wrap items-end gap-1.5 overflow-hidden">
          {input.priority !== "none" && (
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
        <div className="space-y-2">
          <Typography variant="h6" className="line-clamp-2 leading-tight">
            {input.title}
          </Typography>
          {input.summary && (
            <Typography variant="blockquote" affects={["muted", "small"]} className="line-clamp-2">
              {input.summary?.trim()}
            </Typography>
          )}
          {input.content ? (
            <Typography affects={["muted"]} className="line-clamp-4">
              {input.content?.trim()}
            </Typography>
          ) : (
            <Typography className="italic" affects={["muted", "small"]}>
              No content
            </Typography>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleReject}
          disabled={createNoteMutation.isPending}
          isLoading={createNoteMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleApprove}
          disabled={createNoteMutation.isPending}
          isLoading={createNoteMutation.isPending}
        >
          Create
        </Button>
      </CardFooter>
    </Card>
  )
}

export { NoteCreationConfirmation }
