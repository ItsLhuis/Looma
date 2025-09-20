"use client"

import { Fragment, useEffect } from "react"

import { useAutoScroll, useChat } from "@/features/ai/hooks"

import { Button, Fade, Icon } from "@/components/ui"

import { Container, Navbar } from "@/components/layout"
import { ChatInput, ChatMessages } from "@/features/ai/components"

export default function ChatPage() {
  const { messages, status, error, isTyping, sendMessage, clearMessages, stop, addToolResult } =
    useChat()

  const {
    scrollRef,
    scrollToBottom,
    scrollToBottomIfNeeded,
    setShouldAutoScroll,
    isAtBottom,
    shouldAutoScroll
  } = useAutoScroll({
    threshold: 100,
    behavior: "smooth",
    enabled: true
  })

  useEffect(() => {
    scrollToBottomIfNeeded()
  }, [messages, status, scrollToBottomIfNeeded])

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === "user") {
        setShouldAutoScroll(true)
        setTimeout(() => {
          scrollToBottom()
        }, 50)
      }
    }
  }, [messages, setShouldAutoScroll, scrollToBottom])

  useEffect(() => {
    if (status === "streaming" && shouldAutoScroll && isAtBottom) {
      const interval = setInterval(() => {
        scrollToBottomIfNeeded()
      }, 100)

      return () => clearInterval(interval)
    }
  }, [status, shouldAutoScroll, isAtBottom, scrollToBottomIfNeeded])

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
      <Container ref={scrollRef} className="relative flex flex-1 flex-col">
        <ChatMessages
          messages={messages}
          status={status}
          error={error ? "Something went wrong. Please try again." : null}
          onToolResult={(toolCallId, toolName, output) => {
            addToolResult({
              toolCallId,
              tool: toolName,
              output
            })
          }}
        />
        <Fade
          show={!shouldAutoScroll && !isAtBottom && messages.length > 0}
          className="absolute right-6 bottom-6"
        >
          <Button
            onClick={() => {
              setShouldAutoScroll(true)
              scrollToBottom()
            }}
            size="icon"
          >
            <Icon name="ArrowDown" />
          </Button>
        </Fade>
      </Container>
      <ChatInput onSendMessage={sendMessage} onStop={stop} status={status} disabled={isTyping} />
    </Fragment>
  )
}
