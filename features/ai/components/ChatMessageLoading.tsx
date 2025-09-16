"use client"

import Image from "next/image"

import { Spinner, Typography } from "@/components/ui"

function ChatMessageLoading() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Image src="/icon.png" alt="AI" width={24} height={24} />
        <Typography affects={["small", "muted"]}>Looma</Typography>
      </div>
      <div className="flex items-center gap-2">
        <Spinner variant="ellipsis" size={20} className="text-muted-foreground" />
        <Typography affects={["muted", "small"]}>Thinking</Typography>
      </div>
    </div>
  )
}

export { ChatMessageLoading }
