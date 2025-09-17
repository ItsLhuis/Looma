import type { InsertMemoryType, UpdateMemoryType } from "@/features/memories/schemas"
import type { Memory, QueryMemoriesParams } from "@/features/memories/types"

export type ListMemoriesRequest = QueryMemoriesParams
export type ListMemoriesResponse = { data: Memory[]; total: number }

export type GetMemoryResponse = { data: Memory }

export type CreateMemoryRequest = InsertMemoryType
export type CreateMemoryResponse = { data: Memory }

export type UpdateMemoryRequest = UpdateMemoryType
export type UpdateMemoryResponse = { data: Memory }

export type DeleteMemoryResponse = { data: Memory }
