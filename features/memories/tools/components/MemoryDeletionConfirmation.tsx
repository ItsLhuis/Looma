"use client"

import { cn } from "@/lib/utils"

import { useDeleteMemory } from "@/features/memories/api/mutations"

import { formatDateForDisplay } from "@/lib/date"

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

import { getImportanceClasses, getImportanceIcon } from "@/features/memories/utils/status.utils"

import type { DeleteMemoryToolInput } from "../schemas/memory.schema"

type MemoryDeletionConfirmationProps = {
  toolCallId: string
  input: DeleteMemoryToolInput
  onApprove: (toolCallId: string, output: string) => void
  onReject: (toolCallId: string, output: string) => void
}

function MemoryDeletionConfirmation({
  toolCallId,
  input,
  onApprove,
  onReject
}: MemoryDeletionConfirmationProps) {
  const deleteMemoryMutation = useDeleteMemory(input.id)

  const handleApprove = async () => {
    try {
      const deletedMemory = await deleteMemoryMutation.mutateAsync()

      const result = {
        type: "MEMORY_DELETED",
        data: {
          id: deletedMemory.data.id,
          title: deletedMemory.data.title,
          content: deletedMemory.data.content,
          importance: deletedMemory.data.importance,
          isActive: deletedMemory.data.isActive
        },
        message: `Memory "${deletedMemory.data.title}" has been permanently deleted!`
      }

      onApprove(toolCallId, JSON.stringify(result))
    } catch (error) {
      const errorResult = {
        type: "ERROR",
        message: `Failed to delete memory: ${error instanceof Error ? error.message : "Unknown error"}`
      }
      onApprove(toolCallId, JSON.stringify(errorResult))
    }
  }

  const handleReject = async () => {
    const result = {
      type: "MEMORY_DELETION_CANCELLED",
      data: {
        id: input.id,
        title: input.title,
        content: input.content,
        importance: input.importance,
        isActive: input.isActive
      },
      message: "Memory deletion was cancelled by user."
    }

    onReject(toolCallId, JSON.stringify(result))
  }

  return (
    <Card aria-label={`Delete Memory: ${input.title}`}>
      <CardHeader className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Icon name="Trash" className="h-5 w-5" />
            <Typography variant="h5" className="line-clamp-2 leading-tight">
              Delete Memory
            </Typography>
          </div>
          <Typography affects={["muted", "small"]}>This action cannot be undone</Typography>
        </div>
        <div className="flex max-w-full shrink-0 flex-col flex-wrap items-end gap-1.5 overflow-hidden">
          <Badge
            className={cn(
              getImportanceClasses(input.importance || "medium"),
              "shrink-0 capitalize"
            )}
          >
            <Icon name={getImportanceIcon(input.importance || "medium")} className="mr-1 h-3 w-3" />
            {input.importance || "medium"}
          </Badge>
          {input.isActive === false && (
            <Badge variant="outline" className="shrink-0">
              <Icon name="Pause" className="mr-1 h-3 w-3" />
              Inactive
            </Badge>
          )}
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex h-full flex-col gap-6 wrap-break-word">
        <Typography variant="h6" className="line-clamp-2 leading-tight">
          {input.title}
        </Typography>
        {input.content ? (
          <Typography affects={["muted", "small"]} className="line-clamp-4">
            {input.content.trim()}
          </Typography>
        ) : (
          <Typography className="italic" affects={["muted", "small"]}>
            No content
          </Typography>
        )}
        <div className="flex items-center gap-2">
          <Icon name="Clock" className="text-muted-foreground h-4 w-4" />
          <Typography affects={["muted", "small"]}>
            Will be deleted: {formatDateForDisplay(new Date())}
          </Typography>
        </div>
        <div className="bg-destructive/10 border-destructive/20 rounded-md border p-3">
          <Typography affects={["muted", "small"]} className="text-center">
            Are you sure you want to delete this memory? This action cannot be undone.
          </Typography>
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="flex items-end justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleReject}
          disabled={deleteMemoryMutation.isPending}
          isLoading={deleteMemoryMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={handleApprove}
          disabled={deleteMemoryMutation.isPending}
          isLoading={deleteMemoryMutation.isPending}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}

export { MemoryDeletionConfirmation }
