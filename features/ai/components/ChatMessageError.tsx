"use client"

import Image from "next/image"

import { Typography } from "@/components/ui"

type ChatMessageErrorProps = {
  error: string
}

function ChatMessageError({ error }: ChatMessageErrorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Image src="/icon.png" alt="AI" width={24} height={24} />
        <Typography affects={["small", "muted"]}>Looma</Typography>
      </div>
      <div className="space-y-3">
        <Typography affects={["muted", "small"]} className="text-destructive">
          {error}
        </Typography>
      </div>
    </div>
  )
}

export { ChatMessageError }
