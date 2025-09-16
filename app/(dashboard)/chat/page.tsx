"use client"

import { Fragment } from "react"

import { useChat } from "@/features/ai/hooks"

import { Button, Icon } from "@/components/ui"

import { Container, Navbar } from "@/components/layout"
import { ChatInput, ChatMessages } from "@/features/ai/components"

export default function ChatPage() {
  const { messages, status, error, isTyping, sendMessage, clearMessages, stop } = useChat()

  return (
    <Fragment>
      <Navbar title="Chat">
        <Button
          variant="outline"
          size="sm"
          onClick={clearMessages}
          disabled={!messages.length || isTyping}
        >
          <Icon name="Trash" />
          Clear Messages
        </Button>
      </Navbar>
      <Container>
        <ChatMessages
          messages={messages}
          status={status}
          error={error ? "Something went wrong. Please try again." : null}
        />
      </Container>
      <ChatInput onSendMessage={sendMessage} onStop={stop} status={status} disabled={isTyping} />
    </Fragment>
  )
}
