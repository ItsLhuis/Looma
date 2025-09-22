"use client"

import { cn } from "@/lib/utils"

import { formatDateForDisplay } from "@/lib/date"

import { Badge, Card, CardContent, CardHeader, Icon, Separator, Typography } from "@/components/ui"

import {
  getActionStatusClasses,
  getActionStatusColor,
  getActionStatusIcon,
  getImportanceClasses,
  getImportanceIcon
} from "@/features/memories/utils/status.utils"

import type { UpdateMemoryToolInput } from "../schemas/memory.schema"

type MemoryUpdateCancelledConfirmationProps = {
  memoryData: UpdateMemoryToolInput
}

function MemoryUpdateCancelledConfirmation({ memoryData }: MemoryUpdateCancelledConfirmationProps) {
  return (
    <Card
      className={cn("flex flex-col", getActionStatusClasses("cancelled"))}
      aria-label={`Memory Update Cancelled: ${memoryData.title}`}
    >
      <CardHeader className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Icon
              name={getActionStatusIcon("cancelled")}
              className={cn("h-5 w-5", getActionStatusColor("cancelled"))}
            />
            <Typography variant="h5" className="line-clamp-2 leading-tight">
              Memory Update Cancelled
            </Typography>
          </div>
          <Typography affects={["muted", "small"]}>Memory update was cancelled by user</Typography>
        </div>
        <div className="flex max-w-full shrink-0 flex-col flex-wrap items-end gap-1.5 overflow-hidden">
          <Badge
            className={cn(
              getImportanceClasses(memoryData.importance || "medium"),
              "shrink-0 capitalize"
            )}
          >
            <Icon
              name={getImportanceIcon(memoryData.importance || "medium")}
              className="mr-1 h-3 w-3"
            />
            {memoryData.importance || "medium"}
          </Badge>
          {memoryData.isActive === false && (
            <Badge variant="outline" className="shrink-0">
              <Icon name="Pause" className="mr-1 h-3 w-3" />
              Inactive
            </Badge>
          )}
        </div>
      </CardHeader>
      <Separator className="bg-error/20" />
      <CardContent className="flex h-full flex-col gap-6 wrap-break-word">
        <Typography variant="h6" className="line-clamp-2 leading-tight">
          {memoryData.title}
        </Typography>
        {memoryData.content ? (
          <Typography affects={["muted", "small"]} className="line-clamp-4">
            {memoryData.content.trim()}
          </Typography>
        ) : (
          <Typography className="italic" affects={["muted", "small"]}>
            No content
          </Typography>
        )}
        <div className="flex items-center gap-2">
          <Icon name="Clock" className="text-muted-foreground h-4 w-4" />
          <Typography affects={["muted", "small"]}>
            Cancelled: {formatDateForDisplay(new Date())}
          </Typography>
        </div>
        <div className="bg-error/10 border-error/20 rounded-md border p-3">
          <Typography affects={["muted", "small"]} className="text-center">
            This memory was not updated. You can ask me to update it again if needed.
          </Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export { MemoryUpdateCancelledConfirmation }
