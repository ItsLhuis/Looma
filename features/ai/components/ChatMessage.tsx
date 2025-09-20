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
  NoteCancelledConfirmation,
  NoteCreatedConfirmation,
  NoteCreationConfirmation,
  NoteUpdateConfirmation,
  NoteUpdatedConfirmation,
  NoteUpdateCancelledConfirmation,
  NoteDeleteConfirmation,
  NoteDeletedConfirmation,
  NoteDeleteCancelledConfirmation
} from "@/features/notes/tools/components"

import type {
  CreateNoteToolInput,
  UpdateNoteToolInput,
  DeleteNoteToolInput
} from "@/features/notes/tools/schemas"

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
                      <NoteCancelledConfirmation
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
                        <NoteCancelledConfirmation
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
