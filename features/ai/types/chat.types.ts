import { UIMessage } from "ai"

export type ChatMessage = UIMessage & {
  id: string
  role: "user" | "assistant"
  parts: Array<
    | {
        type: "text"
        text: string
      }
    | {
        type: "file"
        filename?: string
        mediaType?: string
        url: string
      }
  >
  createdAt?: Date
}

export type ChatState = {
  messages: ChatMessage[]
  status: "ready" | "submitted" | "streaming" | "error"
  error: string | null
  isTyping: boolean
}

export type ChatActions = {
  sendMessage: (text: string) => void
  clearMessages: () => void
  setStatus: (status: ChatState["status"]) => void
  setError: (error: string | null) => void
  setIsTyping: (isTyping: boolean) => void
  addMessage: (message: ChatMessage) => void
  updateMessage: (id: string, message: Partial<ChatMessage>) => void
  removeMessage: (id: string) => void
}

export type ChatStore = ChatState & ChatActions
