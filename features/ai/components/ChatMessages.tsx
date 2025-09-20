"use client"

import { isToolUIPart } from "ai"

import { cn } from "@/lib/utils"

import { Typography } from "@/components/ui"

import { ChatMessage } from "./ChatMessage"
import { ChatMessageError } from "./ChatMessageError"
import { ChatMessageLoading } from "./ChatMessageLoading"

import type { ChatMessage as ChatMessageType } from "../types"

type ChatMessagesProps = {
  messages: ChatMessageType[]
  status: "ready" | "submitted" | "streaming" | "error"
  error?: string | null
  className?: string
  onToolResult?: (toolCallId: string, toolName: string, output: string) => void
}

function ChatMessages({ messages, status, error, className, onToolResult }: ChatMessagesProps) {
  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center py-6">
        <div className="flex flex-col space-y-2 text-center">
          <Typography variant="h3">Start a conversation</Typography>
          <Typography affects={["muted", "small"]}>
            Ask me anything or share images to get started
          </Typography>
        </div>
      </div>
    )
  }

  const lastMessage = messages[messages.length - 1]
  const hasToolCalls =
    lastMessage?.role === "assistant" && lastMessage.parts.some((part) => isToolUIPart(part))

  return (
    <div className={cn("space-y-6", className)}>
      {messages.map((message, index) => (
        <ChatMessage
          key={message.id}
          message={message}
          onToolResult={onToolResult}
          isLatestMessage={index === messages.length - 1}
        />
      ))}
      {status === "submitted" && <ChatMessageLoading showHeader={!hasToolCalls} />}
      {status === "error" && error && <ChatMessageError error={error} />}
    </div>
  )
}

export { ChatMessages }
