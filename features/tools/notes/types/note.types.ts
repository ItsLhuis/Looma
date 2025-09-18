import type { CreateNoteToolInput, ApprovalStatus } from "../schemas/note.schema"

export interface NoteCreationToolCall {
  toolCallId: string
  toolName: "createNote"
  input: CreateNoteToolInput
  state: "input-available" | "result-available"
  output?: ApprovalStatus | string
}

export interface NoteCreationConfirmationData {
  toolCallId: string
  approved: boolean
  noteData: CreateNoteToolInput
}

export interface NoteCreationResult {
  success: boolean
  noteId?: string
  message: string
  noteData?: CreateNoteToolInput
}
