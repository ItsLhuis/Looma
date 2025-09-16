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
  Dialog,
  DialogContent,
  DialogTrigger,
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
                    <DialogContent className="max-w-4xl p-12">
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
              return null
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export { ChatMessage }
