"use client"

import { Fragment } from "react"

import { useChat } from "@/features/ai/hooks"

import { Button, Icon } from "@/components/ui"

import { Container, Navbar } from "@/components/layout"
import { ChatInput, ChatMessages } from "@/features/ai/components"

export default function ChatPage() {
  const { messages, status, isTyping, sendMessage, clearMessages, stop, reload } = useChat()

  return (
    <Fragment>
      <Navbar title="Chat">
        <Button
          variant="outline"
          size="sm"
          onClick={clearMessages}
          disabled={!messages.length || isTyping}
        >
          <Icon name="Plus" />
          Clear Messages
        </Button>
      </Navbar>
      <Container>
        <ChatMessages messages={messages} />
      </Container>
      <ChatInput
        onSendMessage={sendMessage}
        onStop={stop}
        onReload={reload}
        status={status}
        disabled={isTyping}
      />
    </Fragment>
  )
}
