"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

import { ScrollArea, Typography } from "@/components/ui"

import { ChatMessage } from "./ChatMessage"

import type { ChatMessage as ChatMessageType } from "../types"

type ChatMessagesProps = {
  messages: ChatMessageType[]
  className?: string
}

function ChatMessages({ messages, className }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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

  return (
    <ScrollArea className={cn("flex-1", className)}>
      <div className="space-y-6">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}

export { ChatMessages }
