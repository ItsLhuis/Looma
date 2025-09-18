"use client"

import { cn } from "@/lib/utils"

import { Badge, Card, CardContent, CardHeader, Icon, Separator, Typography } from "@/components/ui"

import type { CreateNoteToolInput } from "../schemas/note.schema"

type NoteCancelledConfirmationProps = {
  noteData: CreateNoteToolInput
}

function NoteCancelledConfirmation({ noteData }: NoteCancelledConfirmationProps) {
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
    <Card
      className={cn("flex flex-col", "border-error/20 bg-error/5")}
      aria-label={`Note Creation Cancelled: ${noteData.title}`}
    >
      <CardHeader className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon name="X" className="text-error h-5 w-5" />
          <Typography variant="h5" className="line-clamp-2 leading-tight">
            Note Creation Cancelled
          </Typography>
        </div>
        <div className="flex max-w-full shrink-0 flex-col flex-wrap items-end gap-1.5 overflow-hidden">
          {noteData.priority !== "none" && (
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
        <div className="space-y-2">
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
        </div>
        <div className="bg-error/10 border-error/20 rounded-md border p-3">
          <Typography affects={["muted", "small"]} className="text-center">
            This note was not created. You can ask me to create it again or modify the details.
          </Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export { NoteCancelledConfirmation }
