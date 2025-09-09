import * as schema from "@/database/schema"

import { createInsertSchema, createUpdateSchema } from "drizzle-zod"

import { z } from "zod"

const { notes } = schema

export const createInsertNoteSchema = () => {
  return createInsertSchema(notes, {
    title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters")
  }).omit({ userId: true, id: true })
}

export type InsertNoteType = z.infer<ReturnType<typeof createInsertNoteSchema>>

export const createUpdateNoteSchema = () => {
  return createUpdateSchema(notes, {
    title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters")
  }).omit({ userId: true, id: true })
}

export type UpdateNoteType = z.infer<ReturnType<typeof createUpdateNoteSchema>>
