import type { InsertNoteType, UpdateNoteType } from "@/features/notes/schemas"
import type { Note, QueryNotesParams } from "@/features/notes/types"

export type ListNotesRequest = QueryNotesParams
export type ListNotesResponse = { data: Note[]; total: number }

export type GetNoteResponse = { data: Note }

export type CreateNoteRequest = InsertNoteType
export type CreateNoteResponse = { data: Note }

export type UpdateNoteRequest = UpdateNoteType
export type UpdateNoteResponse = { data: Note }

export type DeleteNoteResponse = { data: Note }
