"use client"

import { useChat as useAIChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"

export function useChat() {
  const {
    messages,
    sendMessage: aiSendMessage,
    status,
    error,
    stop,
    setMessages
  } = useAIChat({
    transport: new DefaultChatTransport({
      api: "/api/ai/chat"
    })
  })

  const handleSendMessage = (text: string, files?: File[]) => {
    if (!text.trim() && (!files || files.length === 0)) return

    const filePromises =
      files?.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
      }) || []

    if (filePromises.length > 0) {
      Promise.all(filePromises).then((encodedFiles) => {
        aiSendMessage({
          text: text || "Please analyze these images",
          files: encodedFiles.map((dataUrl, index) => ({
            type: "file",
            filename: files![index].name,
            mediaType: files![index].type,
            url: dataUrl
          }))
        })
      })
    } else {
      aiSendMessage({ text })
    }
  }

  const handleClearMessages = () => {
    setMessages([])
  }

  const isTyping = status === "submitted" || status === "streaming"

  return {
    messages,
    status,
    error,
    isTyping,
    sendMessage: handleSendMessage,
    clearMessages: handleClearMessages,
    stop
  }
}
