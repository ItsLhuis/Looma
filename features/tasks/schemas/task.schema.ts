import * as schema from "@/database/schema"

import { createInsertSchema, createUpdateSchema } from "drizzle-zod"

import { z } from "zod"

const { tasks } = schema

export const createInsertTaskSchema = () => {
  return createInsertSchema(tasks, {
    title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters")
  }).omit({ userId: true, id: true, completedAt: true, position: true })
}

export type InsertTaskType = z.infer<ReturnType<typeof createInsertTaskSchema>>

export const createUpdateTaskSchema = () => {
  return createUpdateSchema(tasks, {
    title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters")
  }).omit({ userId: true, id: true, completedAt: true, position: true })
}

export type UpdateTaskType = z.infer<ReturnType<typeof createUpdateTaskSchema>>
