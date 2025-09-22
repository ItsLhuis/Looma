import type {
  ApprovalStatus,
  CreateNoteToolInput,
  DeleteNoteToolInput,
  UpdateNoteToolInput
} from "../schemas/note.schema"

export type NoteCreationToolCall = {
  toolCallId: string
  toolName: "createNote"
  input: CreateNoteToolInput
  state: "input-available" | "result-available"
  output?: ApprovalStatus | string
}

export type NoteUpdateToolCall = {
  toolCallId: string
  toolName: "updateNote"
  input: UpdateNoteToolInput
  state: "input-available" | "result-available"
  output?: ApprovalStatus | string
}

export type NoteDeleteToolCall = {
  toolCallId: string
  toolName: "deleteNote"
  input: DeleteNoteToolInput
  state: "input-available" | "result-available"
  output?: ApprovalStatus | string
}

export type NoteCreationConfirmationData = {
  toolCallId: string
  approved: boolean
  noteData: CreateNoteToolInput
}

export type NoteUpdateConfirmationData = {
  toolCallId: string
  approved: boolean
  noteData: UpdateNoteToolInput
}

export type NoteDeleteConfirmationData = {
  toolCallId: string
  approved: boolean
  noteData: DeleteNoteToolInput
}

export type NoteToolResult = {
  type:
    | "NOTE_CREATED"
    | "NOTE_UPDATED"
    | "NOTE_DELETED"
    | "NOTE_CREATION_CANCELLED"
    | "NOTE_UPDATE_CANCELLED"
    | "NOTE_DELETE_CANCELLED"
    | "ERROR"
  data?: {
    noteId?: string
    noteData?: CreateNoteToolInput | UpdateNoteToolInput | DeleteNoteToolInput
    message?: string
  }
  message: string
}

export type NoteListResult = {
  notes: Array<{
    id: string
    title: string
    content: string | null
    summary: string | null
    priority: "none" | "low" | "medium" | "high" | "urgent"
    isFavorite: boolean
    isArchived: boolean
    createdAt: Date
    updatedAt: Date
  }>
  total: number
  limit: number
  offset: number
  hasMore: boolean
  filters?: {
    search?: string
    priority?: string | string[]
    isFavorite?: boolean
    isArchived?: boolean
  }
}

export type NoteSearchResult = {
  notes: Array<{
    id: string
    title: string
    content: string | null
    summary: string | null
    priority: "none" | "low" | "medium" | "high" | "urgent"
    isFavorite: boolean
    isArchived: boolean
    createdAt: Date
    updatedAt: Date
  }>
  query: string
  count: number
}

export type NoteStats = {
  total: number
  byPriority: {
    none: number
    low: number
    medium: number
    high: number
    urgent: number
  }
  favorites: number
  archived: number
  recent: number
  averageLength: number
  filters?: {
    priority?: string | string[]
    isFavorite?: boolean
    isArchived?: boolean
  }
}
