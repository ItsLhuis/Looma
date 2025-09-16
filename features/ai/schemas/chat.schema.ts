import { z } from "zod"

export const chatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  parts: z.array(
    z.object({
      type: z.literal("text"),
      text: z.string()
    })
  ),
  createdAt: z.date().optional()
})

export const chatStateSchema = z.object({
  messages: z.array(chatMessageSchema),
  status: z.enum(["ready", "submitted", "streaming", "error"]),
  error: z.string().nullable(),
  isTyping: z.boolean()
})

export type ChatMessageSchema = z.infer<typeof chatMessageSchema>
export type ChatStateSchema = z.infer<typeof chatStateSchema>
