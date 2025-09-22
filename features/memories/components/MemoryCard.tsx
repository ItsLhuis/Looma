"use client"

import { cn } from "@/lib/utils"

import { formatDateForDisplay } from "@/lib/date"

import Link from "next/link"

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
import { DeleteMemoryDialog } from "./DeleteMemoryDialog"

import type { Memory, MemoryImportance } from "@/features/memories/types"

const getImportanceClasses = (importance: MemoryImportance) => {
  switch (importance) {
    case "critical":
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

export type MemoryCardProps = {
  memory: Memory
  className?: string
}

function MemoryCard({ memory, className }: MemoryCardProps) {
  return (
    <Card className={cn("flex flex-col", className)} aria-label={`Memory ${memory.title}`}>
      <CardHeader className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <Typography variant="h5" className="line-clamp-2 leading-tight">
            {memory.title}
          </Typography>
          <Typography affects={["muted", "small"]}>
            Updated at {formatDateForDisplay(new Date(memory.updatedAt))}
          </Typography>
        </div>
        <div className="flex max-w-full shrink-0 flex-col flex-wrap items-end gap-1.5 overflow-hidden">
          <Badge className={cn(getImportanceClasses(memory.importance), "shrink-0 capitalize")}>
            {memory.importance}
          </Badge>
          {!memory.isActive && (
            <Badge variant="outline" className="shrink-0">
              <Icon name="Archive" />
              Inactive
            </Badge>
          )}
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex h-full flex-col gap-6 wrap-break-word">
        {memory.content ? (
          <Typography affects={["muted", "small"]} className="line-clamp-4">
            {memory.content?.trim()}
          </Typography>
        ) : (
          <Typography className="italic" affects={["muted", "small"]}>
            No content
          </Typography>
        )}
      </CardContent>
      <CardFooter className="flex items-end justify-end gap-2">
        <Button size="sm" variant="outline" asChild aria-label="Edit memory">
          <Link href={`/memories/${memory.id}`}>Edit</Link>
        </Button>
        <DeleteMemoryDialog
          memoryId={memory.id}
          trigger={
            <Button size="sm" variant="destructive" aria-label="Delete memory">
              Delete
            </Button>
          }
        />
      </CardFooter>
    </Card>
  )
}

export { MemoryCard }
