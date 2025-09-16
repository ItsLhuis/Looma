"use client"

import { useEffect } from "react"

import { useChat as useAIChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"

import { useChatStore } from "./useChatStore"

export function useChat() {
  const {
    status: storeStatus,
    error: storeError,
    isTyping,
    clearMessages: storeClearMessages,
    setStatus,
    setError,
    setIsTyping
  } = useChatStore()

  const {
    messages: aiMessages,
    sendMessage: aiSendMessage,
    status: aiStatus,
    error: aiError,
    stop,
    setMessages: setAiMessages
  } = useAIChat({
    transport: new DefaultChatTransport({
      api: "/api/ai/chat"
    }),
    onFinish: () => {
      setStatus("ready")
      setIsTyping(false)
    },
    onError: (error) => {
      setError(error?.message || "An error occurred")
      setStatus("error")
      setIsTyping(false)
    }
  })

  useEffect(() => {
    setStatus(aiStatus)
    if (aiStatus === "streaming") {
      setIsTyping(true)
    }
  }, [aiStatus, setStatus, setIsTyping])

  useEffect(() => {
    if (aiError) {
      setError(aiError.message || "An error occurred")
    }
  }, [aiError, setError])

  const handleSendMessage = (text: string, files?: File[]) => {
    if (!text.trim() && (!files || files.length === 0)) return

    setIsTyping(true)

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
    setAiMessages([])
    storeClearMessages()
  }

  const handleStop = () => {
    stop()
    setStatus("ready")
    setIsTyping(false)
  }

  const handleReload = () => {
    setError(null)
    setStatus("ready")
  }

  const displayMessages = aiMessages.map((message) => ({
    id: message.id,
    role: message.role === "system" ? "assistant" : message.role,
    parts: message.parts.map((part) => {
      if (part.type === "text") {
        return {
          type: "text" as const,
          text: part.text
        }
      }
      if (part.type === "file") {
        return {
          type: "file" as const,
          filename: part.filename,
          mediaType: part.mediaType,
          url: part.url
        }
      }
      return {
        type: "text" as const,
        text: ""
      }
    }),
    createdAt: new Date()
  }))

  return {
    messages: displayMessages,
    status: storeStatus,
    error: storeError,
    isTyping,
    sendMessage: handleSendMessage,
    clearMessages: handleClearMessages,
    stop: handleStop,
    reload: handleReload
  }
}
