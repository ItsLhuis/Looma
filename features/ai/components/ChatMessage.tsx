"use client"

import { getToolName, isToolUIPart } from "ai"

import { useUser } from "@/contexts/UserProvider"

import Image from "next/image"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  DialogTrigger,
  MarkdownRenderer,
  Typography
} from "@/components/ui"

import {
  NoteCreatedConfirmation,
  NoteCreationCancelledConfirmation,
  NoteCreationConfirmation,
  NoteDeleteCancelledConfirmation,
  NoteDeleteConfirmation,
  NoteDeletedConfirmation,
  NoteUpdateCancelledConfirmation,
  NoteUpdateConfirmation,
  NoteUpdatedConfirmation
} from "@/features/notes/tools/components"

import {
  TaskCreatedConfirmation,
  TaskCreationCancelledConfirmation,
  TaskCreationConfirmation,
  TaskDeleteCancelledConfirmation,
  TaskDeleteConfirmation,
  TaskDeletedConfirmation,
  TaskUpdateCancelledConfirmation,
  TaskUpdateConfirmation,
  TaskUpdatedConfirmation
} from "@/features/tasks/tools/components"

import {
  EventCreatedConfirmation,
  EventCreationCancelledConfirmation,
  EventCreationConfirmation,
  EventDeleteCancelledConfirmation,
  EventDeleteConfirmation,
  EventDeletedConfirmation,
  EventUpdateCancelledConfirmation,
  EventUpdateConfirmation,
  EventUpdatedConfirmation
} from "@/features/calendar/tools/components"

import {
  MemoryCreatedConfirmation,
  MemoryCreationCancelledConfirmation,
  MemoryCreationConfirmation,
  MemoryDeletedConfirmation,
  MemoryDeletionCancelledConfirmation,
  MemoryDeletionConfirmation,
  MemoryUpdateCancelledConfirmation,
  MemoryUpdateConfirmation,
  MemoryUpdatedConfirmation
} from "@/features/memories/tools/components"

import type {
  CreateNoteToolInput,
  DeleteNoteToolInput,
  UpdateNoteToolInput
} from "@/features/notes/tools/schemas"

import type {
  CreateTaskToolInput,
  DeleteTaskToolInput,
  UpdateTaskToolInput
} from "@/features/tasks/tools/schemas"

import type {
  CreateEventToolInput,
  DeleteEventToolInput,
  UpdateEventToolInput
} from "@/features/calendar/tools/schemas"

import type {
  CreateMemoryToolInput,
  DeleteMemoryToolInput,
  UpdateMemoryToolInput
} from "@/features/memories/tools/schemas"

import type { ChatMessage as ChatMessageType } from "../types"

type ChatMessageProps = {
  message: ChatMessageType
  onToolResult?: (toolCallId: string, toolName: string, output: string) => void
  isLatestMessage?: boolean
}

function ChatMessage({ message, onToolResult, isLatestMessage = false }: ChatMessageProps) {
  const user = useUser()

  const isUser = message.role === "user"

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)

  return (
    <div className="w-full">
      {isUser ? (
        <Card className="gap-0 space-y-2">
          <CardHeader className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={user?.image || undefined} alt={user?.name || ""} />
              <AvatarFallback className="text-xs">
                {user?.name ? getInitials(user.name) : "U"}
              </AvatarFallback>
            </Avatar>
            <Typography affects={["small", "muted"]}>{user?.name}</Typography>
          </CardHeader>
          <CardContent className="space-y-2">
            {message.parts.map((part, index) => {
              if (part.type === "text") {
                return (
                  <Typography key={index} variant="p" className="whitespace-pre-wrap">
                    {part.text}
                  </Typography>
                )
              }
              if (part.type === "file" && part.mediaType?.startsWith("image/")) {
                return (
                  <Dialog key={index}>
                    <DialogTrigger asChild>
                      <div className="bg-muted relative mt-3 h-[100px] w-[100px] cursor-pointer overflow-hidden rounded-md transition-opacity hover:opacity-80">
                        <Image
                          src={part.url}
                          alt={part.filename || "Uploaded image"}
                          fill
                          className="object-cover"
                          sizes="100px"
                          unoptimized={part.url.startsWith("data:")}
                        />
                      </div>
                    </DialogTrigger>
                    <DialogContent showCloseButton={false} className="border-none! bg-transparent!">
                      <div className="relative aspect-video w-full">
                        <Image
                          src={part.url}
                          alt={part.filename || "Uploaded image"}
                          fill
                          className="object-contain"
                          unoptimized={part.url.startsWith("data:")}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                )
              }
              return null
            })}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Image src="/icon.png" alt="AI" width={24} height={24} />
            <Typography affects={["small", "muted"]}>Looma</Typography>
          </div>
          <div className="space-y-2">
            {message.parts.map((part, index) => {
              if (part.type === "text") {
                return (
                  <div key={index}>
                    <MarkdownRenderer content={part.text} />
                  </div>
                )
              }

              if (isToolUIPart(part)) {
                const toolName = getToolName(part)

                if (toolName === "createNote" && part.state === "input-available" && onToolResult) {
                  if (!isLatestMessage) {
                    return (
                      <NoteCreationCancelledConfirmation
                        key={part.toolCallId}
                        noteData={part.input as CreateNoteToolInput}
                      />
                    )
                  }

                  return (
                    <NoteCreationConfirmation
                      key={part.toolCallId}
                      toolCallId={part.toolCallId}
                      input={part.input as CreateNoteToolInput}
                      onApprove={(toolCallId, output) => {
                        onToolResult?.(toolCallId, toolName, output)
                      }}
                      onReject={(toolCallId, output) => {
                        onToolResult?.(toolCallId, toolName, output)
                      }}
                    />
                  )
                }

                if (toolName === "updateNote" && part.state === "input-available" && onToolResult) {
                  if (!isLatestMessage) {
                    return (
                      <NoteUpdateCancelledConfirmation
                        key={part.toolCallId}
                        noteData={part.input as UpdateNoteToolInput}
                      />
                    )
                  }

                  return (
                    <NoteUpdateConfirmation
                      key={part.toolCallId}
                      toolCallId={part.toolCallId}
                      input={part.input as UpdateNoteToolInput}
                      onApprove={(toolCallId, output) => {
                        onToolResult?.(toolCallId, toolName, output)
                      }}
                      onReject={(toolCallId, output) => {
                        onToolResult?.(toolCallId, toolName, output)
                      }}
                    />
                  )
                }

                if (toolName === "deleteNote" && part.state === "input-available" && onToolResult) {
                  if (!isLatestMessage) {
                    return (
                      <NoteDeleteCancelledConfirmation
                        key={part.toolCallId}
                        noteData={part.input as DeleteNoteToolInput}
                      />
                    )
                  }

                  return (
                    <NoteDeleteConfirmation
                      key={part.toolCallId}
                      toolCallId={part.toolCallId}
                      input={part.input as DeleteNoteToolInput}
                      onApprove={(toolCallId, output) => {
                        onToolResult?.(toolCallId, toolName, output)
                      }}
                      onReject={(toolCallId, output) => {
                        onToolResult?.(toolCallId, toolName, output)
                      }}
                    />
                  )
                }

                if (toolName === "createTask" && part.state === "input-available" && onToolResult) {
                  if (!isLatestMessage) {
                    return (
                      <TaskCreationCancelledConfirmation
                        key={part.toolCallId}
                        taskData={part.input as CreateTaskToolInput}
                      />
                    )
                  }

                  return (
                    <TaskCreationConfirmation
                      key={part.toolCallId}
                      toolCallId={part.toolCallId}
                      input={part.input as CreateTaskToolInput}
                      onApprove={(toolCallId, output) => {
                        onToolResult?.(toolCallId, toolName, output)
                      }}
                      onReject={(toolCallId, output) => {
                        onToolResult?.(toolCallId, toolName, output)
                      }}
                    />
                  )
                }

                if (toolName === "updateTask" && part.state === "input-available" && onToolResult) {
                  if (!isLatestMessage) {
                    return (
                      <TaskUpdateCancelledConfirmation
                        key={part.toolCallId}
                        taskData={part.input as UpdateTaskToolInput}
                      />
                    )
                  }

                  return (
                    <TaskUpdateConfirmation
                      key={part.toolCallId}
                      toolCallId={part.toolCallId}
                      input={part.input as UpdateTaskToolInput}
                      onApprove={(toolCallId, output) => {
                        onToolResult?.(toolCallId, toolName, output)
                      }}
                      onReject={(toolCallId, output) => {
                        onToolResult?.(toolCallId, toolName, output)
                      }}
                    />
                  )
                }

                if (toolName === "deleteTask" && part.state === "input-available" && onToolResult) {
                  if (!isLatestMessage) {
                    return (
                      <TaskDeleteCancelledConfirmation
                        key={part.toolCallId}
                        taskData={part.input as DeleteTaskToolInput}
                      />
                    )
                  }

                  return (
                    <TaskDeleteConfirmation
                      key={part.toolCallId}
                      toolCallId={part.toolCallId}
                      input={part.input as DeleteTaskToolInput}
                      onApprove={(toolCallId, output) => {
                        onToolResult?.(toolCallId, toolName, output)
                      }}
                      onReject={(toolCallId, output) => {
                        onToolResult?.(toolCallId, toolName, output)
                      }}
                    />
                  )
                }

                if (
                  toolName === "createEvent" &&
                  part.state === "input-available" &&
                  onToolResult
                ) {
                  if (!isLatestMessage) {
                    return (
                      <EventCreationCancelledConfirmation
                        key={part.toolCallId}
                        eventData={part.input as CreateEventToolInput}
                      />
                    )
                  }

                  return (
                    <EventCreationConfirmation
                      key={part.toolCallId}
                      toolCallId={part.toolCallId}
                      input={part.input as CreateEventToolInput}
                      onApprove={(toolCallId, output) => {
                        onToolResult?.(toolCallId, toolName, output)
                      }}
                      onReject={(toolCallId, output) => {
                        onToolResult?.(toolCallId, toolName, output)
                      }}
                    />
                  )
                }

                if (
                  toolName === "updateEvent" &&
                  part.state === "input-available" &&
                  onToolResult
                ) {
                  if (!isLatestMessage) {
                    return (
                      <EventUpdateCancelledConfirmation
                        key={part.toolCallId}
                        eventData={part.input as UpdateEventToolInput}
                      />
                    )
                  }

                  return (
                    <EventUpdateConfirmation
                      key={part.toolCallId}
                      toolCallId={part.toolCallId}
                      input={part.input as UpdateEventToolInput}
                      onApprove={(toolCallId, output) => {
                        onToolResult?.(toolCallId, toolName, output)
                      }}
                      onReject={(toolCallId, output) => {
                        onToolResult?.(toolCallId, toolName, output)
                      }}
                    />
                  )
                }

                if (
                  toolName === "deleteEvent" &&
                  part.state === "input-available" &&
                  onToolResult
                ) {
                  const eventInput = part.input as DeleteEventToolInput
                  const eventData = {
                    id: eventInput.id,
                    title: eventInput.title,
                    startTime: eventInput.startTime || new Date().toISOString(),
                    endTime: eventInput.endTime,
                    isAllDay: eventInput.isAllDay || false
                  }

                  if (!isLatestMessage) {
                    return (
                      <EventDeleteCancelledConfirmation
                        key={part.toolCallId}
                        eventData={eventData}
                      />
                    )
                  }

                  return (
                    <EventDeleteConfirmation
                      key={part.toolCallId}
                      toolCallId={part.toolCallId}
                      input={eventData}
                      onApprove={(toolCallId, output) => {
                        onToolResult?.(toolCallId, toolName, output)
                      }}
                      onReject={(toolCallId, output) => {
                        onToolResult?.(toolCallId, toolName, output)
                      }}
                    />
                  )
                }

                if (
                  toolName === "createMemory" &&
                  part.state === "input-available" &&
                  onToolResult
                ) {
                  if (!isLatestMessage) {
                    return (
                      <MemoryCreationCancelledConfirmation
                        key={part.toolCallId}
                        memoryData={part.input as CreateMemoryToolInput}
                      />
                    )
                  }

                  return (
                    <MemoryCreationConfirmation
                      key={part.toolCallId}
                      toolCallId={part.toolCallId}
                      input={part.input as CreateMemoryToolInput}
                      onApprove={(toolCallId, output) => {
                        onToolResult?.(toolCallId, toolName, output)
                      }}
                      onReject={(toolCallId, output) => {
                        onToolResult?.(toolCallId, toolName, output)
                      }}
                    />
                  )
                }

                if (
                  toolName === "updateMemory" &&
                  part.state === "input-available" &&
                  onToolResult
                ) {
                  if (!isLatestMessage) {
                    return (
                      <MemoryUpdateCancelledConfirmation
                        key={part.toolCallId}
                        memoryData={part.input as UpdateMemoryToolInput}
                      />
                    )
                  }

                  return (
                    <MemoryUpdateConfirmation
                      key={part.toolCallId}
                      toolCallId={part.toolCallId}
                      input={part.input as UpdateMemoryToolInput}
                      onApprove={(toolCallId, output) => {
                        onToolResult?.(toolCallId, toolName, output)
                      }}
                      onReject={(toolCallId, output) => {
                        onToolResult?.(toolCallId, toolName, output)
                      }}
                    />
                  )
                }

                if (
                  toolName === "deleteMemory" &&
                  part.state === "input-available" &&
                  onToolResult
                ) {
                  if (!isLatestMessage) {
                    return (
                      <MemoryDeletionCancelledConfirmation
                        key={part.toolCallId}
                        memoryData={part.input as DeleteMemoryToolInput}
                      />
                    )
                  }

                  return (
                    <MemoryDeletionConfirmation
                      key={part.toolCallId}
                      toolCallId={part.toolCallId}
                      input={part.input as DeleteMemoryToolInput}
                      onApprove={(toolCallId, output) => {
                        onToolResult?.(toolCallId, toolName, output)
                      }}
                      onReject={(toolCallId, output) => {
                        onToolResult?.(toolCallId, toolName, output)
                      }}
                    />
                  )
                }

                if (
                  toolName === "createNote" &&
                  part.state === "output-available" &&
                  part.output &&
                  typeof part.output === "string"
                ) {
                  try {
                    const outputData = JSON.parse(part.output)
                    if (outputData.type === "NOTE_CREATED") {
                      return (
                        <NoteCreatedConfirmation key={part.toolCallId} noteData={outputData.data} />
                      )
                    }
                    if (outputData.type === "NOTE_CANCELLED") {
                      return (
                        <NoteCreationCancelledConfirmation
                          key={part.toolCallId}
                          noteData={outputData.data}
                        />
                      )
                    }
                  } catch {
                    return (
                      <div key={part.toolCallId} className="bg-muted rounded-lg p-4">
                        <Typography variant="p">{part.output}</Typography>
                      </div>
                    )
                  }
                }

                if (
                  toolName === "updateNote" &&
                  part.state === "output-available" &&
                  part.output &&
                  typeof part.output === "string"
                ) {
                  try {
                    const outputData = JSON.parse(part.output)
                    if (outputData.type === "NOTE_UPDATED") {
                      return (
                        <NoteUpdatedConfirmation key={part.toolCallId} noteData={outputData.data} />
                      )
                    }
                    if (outputData.type === "NOTE_UPDATE_CANCELLED") {
                      return (
                        <NoteUpdateCancelledConfirmation
                          key={part.toolCallId}
                          noteData={outputData.data}
                        />
                      )
                    }
                  } catch {
                    return (
                      <div key={part.toolCallId} className="bg-muted rounded-lg p-4">
                        <Typography variant="p">{part.output}</Typography>
                      </div>
                    )
                  }
                }

                if (
                  toolName === "deleteNote" &&
                  part.state === "output-available" &&
                  part.output &&
                  typeof part.output === "string"
                ) {
                  try {
                    const outputData = JSON.parse(part.output)
                    if (outputData.type === "NOTE_DELETED") {
                      return (
                        <NoteDeletedConfirmation key={part.toolCallId} noteData={outputData.data} />
                      )
                    }
                    if (outputData.type === "NOTE_DELETE_CANCELLED") {
                      return (
                        <NoteDeleteCancelledConfirmation
                          key={part.toolCallId}
                          noteData={outputData.data}
                        />
                      )
                    }
                  } catch {
                    return (
                      <div key={part.toolCallId} className="bg-muted rounded-lg p-4">
                        <Typography variant="p">{part.output}</Typography>
                      </div>
                    )
                  }
                }

                if (
                  toolName === "createTask" &&
                  part.state === "output-available" &&
                  part.output &&
                  typeof part.output === "string"
                ) {
                  try {
                    const outputData = JSON.parse(part.output)
                    if (outputData.type === "TASK_CREATED") {
                      return (
                        <TaskCreatedConfirmation key={part.toolCallId} taskData={outputData.data} />
                      )
                    }
                    if (outputData.type === "TASK_CREATION_CANCELLED") {
                      return (
                        <TaskCreationCancelledConfirmation
                          key={part.toolCallId}
                          taskData={outputData.data}
                        />
                      )
                    }
                  } catch {
                    return (
                      <div key={part.toolCallId} className="bg-muted rounded-lg p-4">
                        <Typography variant="p">{part.output}</Typography>
                      </div>
                    )
                  }
                }

                if (
                  toolName === "updateTask" &&
                  part.state === "output-available" &&
                  part.output &&
                  typeof part.output === "string"
                ) {
                  try {
                    const outputData = JSON.parse(part.output)
                    if (outputData.type === "TASK_UPDATED") {
                      return (
                        <TaskUpdatedConfirmation key={part.toolCallId} taskData={outputData.data} />
                      )
                    }
                    if (outputData.type === "TASK_UPDATE_CANCELLED") {
                      return (
                        <TaskUpdateCancelledConfirmation
                          key={part.toolCallId}
                          taskData={outputData.data}
                        />
                      )
                    }
                  } catch {
                    return (
                      <div key={part.toolCallId} className="bg-muted rounded-lg p-4">
                        <Typography variant="p">{part.output}</Typography>
                      </div>
                    )
                  }
                }

                if (
                  toolName === "deleteTask" &&
                  part.state === "output-available" &&
                  part.output &&
                  typeof part.output === "string"
                ) {
                  try {
                    const outputData = JSON.parse(part.output)
                    if (outputData.type === "TASK_DELETED") {
                      return (
                        <TaskDeletedConfirmation key={part.toolCallId} taskData={outputData.data} />
                      )
                    }
                    if (outputData.type === "TASK_DELETE_CANCELLED") {
                      return (
                        <TaskDeleteCancelledConfirmation
                          key={part.toolCallId}
                          taskData={outputData.data}
                        />
                      )
                    }
                  } catch {
                    return (
                      <div key={part.toolCallId} className="bg-muted rounded-lg p-4">
                        <Typography variant="p">{part.output}</Typography>
                      </div>
                    )
                  }
                }

                if (
                  toolName === "createEvent" &&
                  part.state === "output-available" &&
                  part.output &&
                  typeof part.output === "string"
                ) {
                  try {
                    const outputData = JSON.parse(part.output)
                    if (outputData.type === "EVENT_CREATED") {
                      return (
                        <EventCreatedConfirmation
                          key={part.toolCallId}
                          eventData={outputData.data}
                        />
                      )
                    }
                    if (outputData.type === "EVENT_CREATION_CANCELLED") {
                      return (
                        <EventCreationCancelledConfirmation
                          key={part.toolCallId}
                          eventData={outputData.data}
                        />
                      )
                    }
                  } catch {
                    return (
                      <div key={part.toolCallId} className="bg-muted rounded-lg p-4">
                        <Typography variant="p">{part.output}</Typography>
                      </div>
                    )
                  }
                }

                if (
                  toolName === "updateEvent" &&
                  part.state === "output-available" &&
                  part.output &&
                  typeof part.output === "string"
                ) {
                  try {
                    const outputData = JSON.parse(part.output)
                    if (outputData.type === "EVENT_UPDATED") {
                      return (
                        <EventUpdatedConfirmation
                          key={part.toolCallId}
                          eventData={outputData.data}
                        />
                      )
                    }
                    if (outputData.type === "EVENT_UPDATE_CANCELLED") {
                      return (
                        <EventUpdateCancelledConfirmation
                          key={part.toolCallId}
                          eventData={outputData.data}
                        />
                      )
                    }
                  } catch {
                    return (
                      <div key={part.toolCallId} className="bg-muted rounded-lg p-4">
                        <Typography variant="p">{part.output}</Typography>
                      </div>
                    )
                  }
                }

                if (
                  toolName === "deleteEvent" &&
                  part.state === "output-available" &&
                  part.output &&
                  typeof part.output === "string"
                ) {
                  try {
                    const outputData = JSON.parse(part.output)
                    if (outputData.type === "EVENT_DELETED") {
                      return (
                        <EventDeletedConfirmation
                          key={part.toolCallId}
                          eventData={outputData.data}
                        />
                      )
                    }
                    if (outputData.type === "EVENT_DELETE_CANCELLED") {
                      return (
                        <EventDeleteCancelledConfirmation
                          key={part.toolCallId}
                          eventData={outputData.data}
                        />
                      )
                    }
                  } catch {
                    return (
                      <div key={part.toolCallId} className="bg-muted rounded-lg p-4">
                        <Typography variant="p">{part.output}</Typography>
                      </div>
                    )
                  }
                }

                if (
                  toolName === "createMemory" &&
                  part.state === "output-available" &&
                  part.output &&
                  typeof part.output === "string"
                ) {
                  try {
                    const outputData = JSON.parse(part.output)
                    if (outputData.type === "MEMORY_CREATED") {
                      return (
                        <MemoryCreatedConfirmation
                          key={part.toolCallId}
                          memoryData={outputData.data}
                        />
                      )
                    }
                    if (outputData.type === "MEMORY_CREATION_CANCELLED") {
                      return (
                        <MemoryCreationCancelledConfirmation
                          key={part.toolCallId}
                          memoryData={outputData.data}
                        />
                      )
                    }
                  } catch {
                    return (
                      <div key={part.toolCallId} className="bg-muted rounded-lg p-4">
                        <Typography variant="p">{part.output}</Typography>
                      </div>
                    )
                  }
                }

                if (
                  toolName === "updateMemory" &&
                  part.state === "output-available" &&
                  part.output &&
                  typeof part.output === "string"
                ) {
                  try {
                    const outputData = JSON.parse(part.output)
                    if (outputData.type === "MEMORY_UPDATED") {
                      return (
                        <MemoryUpdatedConfirmation
                          key={part.toolCallId}
                          memoryData={outputData.data}
                        />
                      )
                    }
                    if (outputData.type === "MEMORY_UPDATE_CANCELLED") {
                      return (
                        <MemoryUpdateCancelledConfirmation
                          key={part.toolCallId}
                          memoryData={outputData.data}
                        />
                      )
                    }
                  } catch {
                    return (
                      <div key={part.toolCallId} className="bg-muted rounded-lg p-4">
                        <Typography variant="p">{part.output}</Typography>
                      </div>
                    )
                  }
                }

                if (
                  toolName === "deleteMemory" &&
                  part.state === "output-available" &&
                  part.output &&
                  typeof part.output === "string"
                ) {
                  try {
                    const outputData = JSON.parse(part.output)
                    if (outputData.type === "MEMORY_DELETED") {
                      return (
                        <MemoryDeletedConfirmation
                          key={part.toolCallId}
                          memoryData={outputData.data}
                        />
                      )
                    }
                    if (outputData.type === "MEMORY_DELETION_CANCELLED") {
                      return (
                        <MemoryDeletionCancelledConfirmation
                          key={part.toolCallId}
                          memoryData={outputData.data}
                        />
                      )
                    }
                  } catch {
                    return (
                      <div key={part.toolCallId} className="bg-muted rounded-lg p-4">
                        <Typography variant="p">{part.output}</Typography>
                      </div>
                    )
                  }
                }
              }

              return null
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export { ChatMessage }
