import * as schema from "@/database/schema"

import { createInsertSchema, createUpdateSchema } from "drizzle-zod"

import { z } from "zod"

const { memories } = schema

export const createInsertMemorySchema = () => {
  return createInsertSchema(memories, {
    title: z
      .string()
      .min(1, "Title is required")
      .max(255, "Title must be less than 255 characters"),
    content: z.string().min(1, "Content is required")
  }).omit({ userId: true, id: true })
}

export type InsertMemoryType = z.infer<ReturnType<typeof createInsertMemorySchema>>

export const createUpdateMemorySchema = () => {
  return createUpdateSchema(memories, {
    title: z
      .string()
      .min(1, "Title is required")
      .max(255, "Title must be less than 255 characters"),
    content: z.string().min(1, "Content is required")
  }).omit({ userId: true, id: true })
}

export type UpdateMemoryType = z.infer<ReturnType<typeof createUpdateMemorySchema>>
