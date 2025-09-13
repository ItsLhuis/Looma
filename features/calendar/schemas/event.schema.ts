import * as schema from "@/database/schema"

import { createInsertSchema, createUpdateSchema } from "drizzle-zod"

import { z } from "zod"

const { events } = schema

export const createInsertEventSchema = () => {
  return createInsertSchema(events, {
    title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters")
  }).omit({ userId: true, id: true })
}

export type InsertEventType = z.infer<ReturnType<typeof createInsertEventSchema>>

export const createUpdateEventSchema = () => {
  return createUpdateSchema(events, {
    title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters")
  }).omit({ userId: true, id: true })
}

export type UpdateEventType = z.infer<ReturnType<typeof createUpdateEventSchema>>
