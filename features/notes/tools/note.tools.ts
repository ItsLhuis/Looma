import { tool } from "ai"

import { createNoteToolSchema } from "./schemas/note.schema"

export const createNoteTool = tool({
  description:
    "Create a new note with title, content, priority, and other properties. This requires user confirmation before execution.",
  inputSchema: createNoteToolSchema
})

export const noteTools = {
  createNote: createNoteTool
} as const

export type NoteToolName = keyof typeof noteTools
