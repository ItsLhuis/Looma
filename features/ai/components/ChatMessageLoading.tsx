"use client"

import Image from "next/image"

import { ShinyText, Spinner, Typography } from "@/components/ui"

type ChatMessageLoadingProps = {
  showHeader?: boolean
}

function ChatMessageLoading({ showHeader = true }: ChatMessageLoadingProps) {
  return (
    <div className="space-y-2">
      {showHeader && (
        <div className="flex items-center gap-2">
          <Image src="/icon.png" alt="AI" width={24} height={24} />
          <Typography affects={["small", "muted"]}>Looma</Typography>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Spinner variant="ellipsis" size={20} className="text-muted-foreground" />
        <ShinyText className="text-sm">Thinking</ShinyText>
      </div>
    </div>
  )
}

export { ChatMessageLoading }
