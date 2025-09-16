import { create } from "zustand"
import { persist } from "zustand/middleware"
import { ChatStore, ChatMessage } from "../types"

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      messages: [],
      status: "ready",
      error: null,
      isTyping: false,

      sendMessage: (text: string) => {
        const newMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "user",
          parts: [{ type: "text", text }],
          createdAt: new Date()
        }

        set((state) => ({
          messages: [...state.messages, newMessage],
          status: "submitted",
          error: null
        }))
      },

      clearMessages: () => {
        set({
          messages: [],
          status: "ready",
          error: null,
          isTyping: false
        })
      },

      setStatus: (status) => {
        set({ status })
      },

      setError: (error) => {
        set({ error, status: "error" })
      },

      setIsTyping: (isTyping) => {
        set({ isTyping })
      },

      addMessage: (message) => {
        set((state) => ({
          messages: [...state.messages, message]
        }))
      },

      updateMessage: (id, updates) => {
        set((state) => ({
          messages: state.messages.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg))
        }))
      },

      removeMessage: (id) => {
        set((state) => ({
          messages: state.messages.filter((msg) => msg.id !== id)
        }))
      }
    }),
    {
      name: "chat-store",
      // Only persist messages, not status/error states
      partialize: (state) => ({
        messages: state.messages
      })
    }
  )
)
