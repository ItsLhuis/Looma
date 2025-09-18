import type { ApprovalStatus, CreateNoteToolInput } from "../schemas/note.schema"

export type NoteCreationToolCall = {
  toolCallId: string
  toolName: "createNote"
  input: CreateNoteToolInput
  state: "input-available" | "result-available"
  output?: ApprovalStatus | string
}

export type NoteCreationConfirmationData = {
  toolCallId: string
  approved: boolean
  noteData: CreateNoteToolInput
}

export type NoteCreationResult = {
  success: boolean
  noteId?: string
  message: string
  noteData?: CreateNoteToolInput
}
