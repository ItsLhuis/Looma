"use client"

import { useUser } from "@/contexts/UserProvider"

import Image from "next/image"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Card,
  CardContent,
  CardHeader,
  MarkdownRenderer,
  Typography
} from "@/components/ui"

import type { ChatMessage as ChatMessageType } from "../types"

type ChatMessageProps = {
  message: ChatMessageType
}

function ChatMessage({ message }: ChatMessageProps) {
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
            <Typography variant="span" affects={["small", "muted"]} className="opacity-70">
              {message.createdAt && new Date(message.createdAt).toLocaleTimeString()}
            </Typography>
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
                  <div
                    key={index}
                    className="bg-muted relative my-2 h-full w-full overflow-hidden rounded-md"
                  >
                    <Image
                      src={part.url}
                      alt={part.filename || "Uploaded image"}
                      fill
                      className="object-cover"
                      sizes="125px"
                      unoptimized={part.url.startsWith("data:")}
                    />
                  </div>
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
            <Typography variant="span" affects={["small", "muted"]} className="opacity-70">
              {message.createdAt && new Date(message.createdAt).toLocaleTimeString()}
            </Typography>
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
              return null
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export { ChatMessage }
