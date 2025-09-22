import type { Memory, MemoryImportance } from "@/features/memories/types"

import type {
  ApprovalStatus,
  CreateMemoryToolInput,
  DeleteMemoryToolInput,
  UpdateMemoryToolInput
} from "../schemas/memory.schema"

export type MemoryCreationToolCall = {
  toolCallId: string
  toolName: "createMemory"
  input: CreateMemoryToolInput
  state: "input-available" | "result-available"
  output?: ApprovalStatus | string
}

export type MemoryUpdateToolCall = {
  toolCallId: string
  toolName: "updateMemory"
  input: UpdateMemoryToolInput
  state: "input-available" | "result-available"
  output?: ApprovalStatus | string
}

export type MemoryDeleteToolCall = {
  toolCallId: string
  toolName: "deleteMemory"
  input: DeleteMemoryToolInput
  state: "input-available" | "result-available"
  output?: ApprovalStatus | string
}

export type MemoryCreationConfirmationData = {
  toolCallId: string
  approved: boolean
  memoryData: CreateMemoryToolInput
}

export type MemoryUpdateConfirmationData = {
  toolCallId: string
  approved: boolean
  memoryData: UpdateMemoryToolInput
}

export type MemoryDeleteConfirmationData = {
  toolCallId: string
  approved: boolean
  memoryData: DeleteMemoryToolInput
}

export type MemoryToolResult = {
  type:
    | "MEMORY_CREATED"
    | "MEMORY_UPDATED"
    | "MEMORY_DELETED"
    | "MEMORY_CREATION_CANCELLED"
    | "MEMORY_UPDATE_CANCELLED"
    | "MEMORY_DELETION_CANCELLED"
    | "ERROR"
  data?: {
    memoryId?: string
    memoryData?: CreateMemoryToolInput | UpdateMemoryToolInput | DeleteMemoryToolInput
    message?: string
  }
  message: string
}

export type MemoryListResult = {
  memories: Memory[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
  filters?: {
    search?: string
    importance?: MemoryImportance | MemoryImportance[]
    isActive?: boolean
  }
}

export type MemorySearchResult = {
  memories: Memory[]
  query: string
  count: number
}

export type MemoryStats = {
  total: number
  byImportance: {
    low: number
    medium: number
    high: number
    critical: number
  }
  active: number
  inactive: number
  recent: number
  averageLength: number
  filters?: {
    search?: string
    importance?: MemoryImportance | MemoryImportance[]
    isActive?: boolean
  }
}

export type MemoryCountByImportance = {
  counts: Array<{
    importance: MemoryImportance
    count: number
  }>
  total: number
  filters?: {
    search?: string
    isActive?: boolean
  }
}

export type MemoryCountByDate = {
  total: number
  startDate?: string
  endDate?: string
  message?: string
}

export type MemorySemanticSearchResult = {
  memories: Array<Memory & { similarity: number }>
  query: string
  count: number
  threshold: number
}

export type MemoryRelevanceResult = {
  memories: Array<Memory & { relevance: number; reason: string }>
  context: string
  count: number
  threshold: number
}
