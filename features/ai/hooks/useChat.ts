"use client"

import { useCallback, useMemo } from "react"

import { useChat as useAIChat } from "@ai-sdk/react"
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai"

export function useChat() {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/ai/chat"
      }),
    []
  )

  const {
    messages,
    sendMessage: aiSendMessage,
    status,
    error,
    stop,
    setMessages,
    addToolResult
  } = useAIChat({
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls
  })

  const handleSendMessage = useCallback(
    async (text: string, files?: File[]) => {
      if (!text.trim() && (!files || files.length === 0)) return

      try {
        if (files && files.length > 0) {
          const filePromises = files.map((file) => {
            return new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result as string)
              reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`))
              reader.readAsDataURL(file)
            })
          })

          const encodedFiles = await Promise.all(filePromises)

          aiSendMessage({
            text: text || "Please analyze these images",
            files: encodedFiles.map((dataUrl, index) => ({
              type: "file",
              filename: files[index].name,
              mediaType: files[index].type,
              url: dataUrl
            }))
          })
        } else {
          aiSendMessage({ text })
        }
      } catch (error) {
        console.error("Error processing files:", error)
        if (text.trim()) {
          aiSendMessage({ text })
        }
      }
    },
    [aiSendMessage]
  )

  const handleClearMessages = useCallback(() => {
    setMessages([])
  }, [setMessages])

  const isTyping = useMemo(() => status === "submitted" || status === "streaming", [status])

  return useMemo(
    () => ({
      messages,
      status,
      error,
      isTyping,
      sendMessage: handleSendMessage,
      clearMessages: handleClearMessages,
      stop,
      addToolResult
    }),
    [messages, status, error, isTyping, handleSendMessage, handleClearMessages, stop, addToolResult]
  )
}
