"use client"

import { cn } from "@/lib/utils"

import { useCreateMemory } from "@/features/memories/api/mutations"

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

import type { CreateMemoryToolInput } from "../schemas/memory.schema"

type MemoryCreationConfirmationProps = {
  toolCallId: string
  input: CreateMemoryToolInput
  onApprove: (toolCallId: string, output: string) => void
  onReject: (toolCallId: string, output: string) => void
}

function MemoryCreationConfirmation({
  toolCallId,
  input,
  onApprove,
  onReject
}: MemoryCreationConfirmationProps) {
  const createMemoryMutation = useCreateMemory()

  const handleApprove = async () => {
    try {
      const createdMemory = await createMemoryMutation.mutateAsync({
        title: input.title,
        content: input.content,
        importance: input.importance,
        isActive: input.isActive
      })

      const result = {
        type: "MEMORY_CREATED",
        data: {
          id: createdMemory.data.id,
          title: createdMemory.data.title,
          content: createdMemory.data.content,
          importance: createdMemory.data.importance,
          isActive: createdMemory.data.isActive
        },
        message: `Memory "${createdMemory.data.title}" has been successfully created!`
      }

      onApprove(toolCallId, JSON.stringify(result))
    } catch (error) {
      const errorResult = {
        type: "ERROR",
        message: `Failed to create memory: ${error instanceof Error ? error.message : "Unknown error"}`
      }
      onApprove(toolCallId, JSON.stringify(errorResult))
    }
  }

  const handleReject = async () => {
    const result = {
      type: "MEMORY_CREATION_CANCELLED",
      data: {
        title: input.title,
        content: input.content,
        importance: input.importance,
        isActive: input.isActive
      },
      message: "Memory creation was cancelled by user."
    }

    onReject(toolCallId, JSON.stringify(result))
  }

  return (
    <Card aria-label={`Create Memory: ${input.title}`}>
      <CardHeader className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Icon name="Plus" className="h-5 w-5" />
            <Typography variant="h5" className="line-clamp-2 leading-tight">
              Create Memory
            </Typography>
          </div>
          <Typography affects={["muted", "small"]}>Review the details before creating</Typography>
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
            Created: {formatDateForDisplay(new Date())}
          </Typography>
        </div>
      </CardContent>
      <CardFooter className="flex items-end justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleReject}
          disabled={createMemoryMutation.isPending}
          isLoading={createMemoryMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleApprove}
          disabled={createMemoryMutation.isPending}
          isLoading={createMemoryMutation.isPending}
        >
          Create
        </Button>
      </CardFooter>
    </Card>
  )
}
export { MemoryCreationConfirmation }
