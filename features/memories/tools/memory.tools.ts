import { tool } from "ai"

import {
  getMemories,
  getMemoryById,
  getRelevantMemories,
  searchMemories,
  searchMemoriesSemantic
} from "../api/dal"

import {
  createMemoryToolSchema,
  deleteMemoryToolSchema,
  getActiveMemoriesToolSchema,
  getInactiveMemoriesToolSchema,
  getMemoriesByImportanceToolSchema,
  getMemoriesCountByDateToolSchema,
  getMemoriesCountByImportanceToolSchema,
  getMemoriesStatsToolSchema,
  getMemoryByIdToolSchema,
  getNewestMemoriesToolSchema,
  getOldestMemoriesToolSchema,
  getRecentMemoriesToolSchema,
  getRelevantMemoriesToolSchema,
  listMemoriesToolSchema,
  searchMemoriesSemanticToolSchema,
  searchMemoriesToolSchema,
  updateMemoryToolSchema,
  type GetActiveMemoriesToolInput,
  type GetInactiveMemoriesToolInput,
  type GetMemoriesByImportanceToolInput,
  type GetMemoriesCountByDateToolInput,
  type GetMemoriesCountByImportanceToolInput,
  type GetMemoriesStatsToolInput,
  type GetMemoryByIdToolInput,
  type GetNewestMemoriesToolInput,
  type GetOldestMemoriesToolInput,
  type GetRecentMemoriesToolInput,
  type GetRelevantMemoriesToolInput,
  type ListMemoriesToolInput,
  type SearchMemoriesSemanticToolInput,
  type SearchMemoriesToolInput
} from "./schemas/memory.schema"

import type {
  MemoryCountByDate,
  MemoryCountByImportance,
  MemoryListResult,
  MemoryRelevanceResult,
  MemorySearchResult,
  MemorySemanticSearchResult,
  MemoryStats
} from "./types/memory.types"

export const createMemoryTool = tool({
  description:
    "Create a new memory. Use when user wants to create/save a new memory. REQUIRED: title (string), content (string). OPTIONAL: importance (low/medium/high/critical), isActive (boolean). Memories store important information for future reference and requires user confirmation before execution.",
  inputSchema: createMemoryToolSchema
})

export const updateMemoryTool = tool({
  description:
    "Update an existing memory by ID. Use when user wants to modify/edit an existing memory. REQUIRED: id (string), title (string), content (string). OPTIONAL: importance (low/medium/high/critical), isActive (boolean). Preserves memory history and requires user confirmation before execution.",
  inputSchema: updateMemoryToolSchema
})

export const deleteMemoryTool = tool({
  description:
    "Permanently delete a memory by ID. Use when user wants to remove/delete a memory completely. REQUIRED: id (string), title (string), content (string). OPTIONAL: importance (low/medium/high/critical), isActive (boolean). This action cannot be undone and requires user confirmation before execution.",
  inputSchema: deleteMemoryToolSchema
})

export const listMemoriesTool = tool({
  description:
    "Retrieve a paginated list of memories with advanced filtering. Use when user wants to see all memories or filtered memories. Supports filtering by importance, active status, and custom sorting options. Supports limit/offset pagination and returns total count.",
  inputSchema: listMemoriesToolSchema,
  execute: async (input: ListMemoriesToolInput) => {
    const result = await getMemories(input)
    return {
      memories: result.data,
      total: result.total,
      limit: input.limit || 20,
      offset: input.offset || 0,
      hasMore: (input.offset || 0) + (input.limit || 20) < result.total,
      filters: input.filters
    } as MemoryListResult
  }
})

export const getMemoryByIdTool = tool({
  description:
    "Retrieve a specific memory by its unique ID. Use when user wants to view details of a specific memory. Returns all metadata, content, and timestamps. Returns error if memory not found.",
  inputSchema: getMemoryByIdToolSchema,
  execute: async (input: GetMemoryByIdToolInput) => {
    const memory = await getMemoryById(input.id)
    if (!memory) {
      return { error: "Memory not found", memory: null }
    }
    return { memory }
  }
})

export const searchMemoriesTool = tool({
  description:
    "Search for memories by text content. Use when user wants to find memories containing specific words or phrases. Performs full-text search across memory titles and content. Returns matching memories with relevance scoring and search query metadata.",
  inputSchema: searchMemoriesToolSchema,
  execute: async (input: SearchMemoriesToolInput) => {
    const memories = await searchMemories(input.query)
    return {
      memories,
      query: input.query,
      count: memories.length
    } as MemorySearchResult
  }
})

export const searchMemoriesSemanticTool = tool({
  description:
    "Search memories using semantic similarity. Use when user mentions topics that might relate to existing memories. Performs intelligent search to find relevant memories based on meaning, not just keywords. Returns memories with similarity scores and relevance metadata.",
  inputSchema: searchMemoriesSemanticToolSchema,
  execute: async (input: SearchMemoriesSemanticToolInput) => {
    const memories = await searchMemoriesSemantic(input.query, input.limit, input.threshold)
    return {
      memories,
      query: input.query,
      count: memories.length,
      threshold: input.threshold
    } as MemorySemanticSearchResult
  }
})

export const getRelevantMemoriesTool = tool({
  description:
    "Get memories relevant to current context. Use when user mentions topics or asks questions that might benefit from past memory context. Automatically finds and returns the most relevant memories based on the current conversation context. This tool should be used proactively to enhance AI responses with relevant past information.",
  inputSchema: getRelevantMemoriesToolSchema,
  execute: async (input: GetRelevantMemoriesToolInput) => {
    const memories = await getRelevantMemories(input.context, input.limit, input.threshold)
    return {
      memories,
      context: input.context,
      count: memories.length,
      threshold: input.threshold
    } as MemoryRelevanceResult
  }
})

export const getMemoriesStatsTool = tool({
  description:
    "Get comprehensive statistics and analytics about user's memories. ALWAYS use this tool when user asks for statistics, how many memories they have, memory counts, importance distribution, analytics, or overview of their memories. This tool provides total count, importance breakdown, active/inactive counts, and other metrics.",
  inputSchema: getMemoriesStatsToolSchema,
  execute: async (input: GetMemoriesStatsToolInput) => {
    const result = await getMemories({
      limit: 1,
      offset: 0,
      filters: input.filters
    })

    const [
      lowImportanceMemories,
      mediumImportanceMemories,
      highImportanceMemories,
      criticalImportanceMemories,
      activeMemories,
      inactiveMemories,
      recentMemories
    ] = await Promise.all([
      getMemories({ limit: 1, offset: 0, filters: { ...input.filters, importance: "low" } }),
      getMemories({ limit: 1, offset: 0, filters: { ...input.filters, importance: "medium" } }),
      getMemories({ limit: 1, offset: 0, filters: { ...input.filters, importance: "high" } }),
      getMemories({ limit: 1, offset: 0, filters: { ...input.filters, importance: "critical" } }),
      getMemories({ limit: 1, offset: 0, filters: { ...input.filters, isActive: true } }),
      getMemories({ limit: 1, offset: 0, filters: { ...input.filters, isActive: false } }),
      getMemories({ limit: 1, offset: 0 })
    ])

    const sampleMemories = await getMemories({ limit: 20, offset: 0 })
    const averageLength =
      sampleMemories.data.length > 0
        ? sampleMemories.data.reduce((sum, memory) => sum + (memory.content?.length || 0), 0) /
          sampleMemories.data.length
        : 0

    return {
      total: result.total,
      byImportance: {
        low: lowImportanceMemories.total,
        medium: mediumImportanceMemories.total,
        high: highImportanceMemories.total,
        critical: criticalImportanceMemories.total
      },
      active: activeMemories.total,
      inactive: inactiveMemories.total,
      recent: recentMemories.total,
      averageLength: Math.round(averageLength),
      filters: input.filters
    } as MemoryStats
  }
})

export const getMemoriesByImportanceTool = tool({
  description:
    "Get memories by importance level. Use when user asks for 'high importance memories', 'critical memories', 'low importance memories', etc. Filters memories by specific importance level (low/medium/high/critical) with pagination support. Returns memories sorted by most recently updated.",
  inputSchema: getMemoriesByImportanceToolSchema,
  execute: async (input: GetMemoriesByImportanceToolInput) => {
    const result = await getMemories({
      limit: input.limit || 20,
      offset: input.offset || 0,
      filters: { importance: input.importance },
      orderBy: { column: "updatedAt", direction: "desc" }
    })
    return {
      memories: result.data,
      total: result.total,
      limit: input.limit || 20,
      offset: input.offset || 0,
      hasMore: (input.offset || 0) + (input.limit || 20) < result.total,
      filters: { importance: input.importance }
    } as MemoryListResult
  }
})

export const getActiveMemoriesTool = tool({
  description:
    "Get all active memories. Use when user asks for 'active memories', 'current memories', or 'enabled memories'. Returns all memories that are currently active with pagination support, sorted by most recently updated.",
  inputSchema: getActiveMemoriesToolSchema,
  execute: async (input: GetActiveMemoriesToolInput) => {
    const result = await getMemories({
      limit: input.limit || 20,
      offset: input.offset || 0,
      filters: { isActive: true },
      orderBy: { column: "updatedAt", direction: "desc" }
    })
    return {
      memories: result.data,
      total: result.total,
      limit: input.limit || 20,
      offset: input.offset || 0,
      hasMore: (input.offset || 0) + (input.limit || 20) < result.total,
      filters: { isActive: true }
    } as MemoryListResult
  }
})

export const getInactiveMemoriesTool = tool({
  description:
    "Get all inactive memories. Use when user asks for 'inactive memories', 'disabled memories', or 'archived memories'. Returns all memories that are currently inactive with pagination support, sorted by most recently updated.",
  inputSchema: getInactiveMemoriesToolSchema,
  execute: async (input: GetInactiveMemoriesToolInput) => {
    const result = await getMemories({
      limit: input.limit || 20,
      offset: input.offset || 0,
      filters: { isActive: false },
      orderBy: { column: "updatedAt", direction: "desc" }
    })
    return {
      memories: result.data,
      total: result.total,
      limit: input.limit || 20,
      offset: input.offset || 0,
      hasMore: (input.offset || 0) + (input.limit || 20) < result.total,
      filters: { isActive: false }
    } as MemoryListResult
  }
})

export const getNewestMemoriesTool = tool({
  description:
    "Get newest memories. Use when user asks for 'newest memories', 'recent memories', 'latest memories', or 'most recent memories'. Returns memories sorted by creation date (newest first) with pagination support. Shows the most recently created memories first.",
  inputSchema: getNewestMemoriesToolSchema,
  execute: async (input: GetNewestMemoriesToolInput) => {
    const result = await getMemories({
      limit: input.limit || 20,
      offset: input.offset || 0,
      orderBy: { column: "createdAt", direction: "desc" }
    })
    return {
      memories: result.data,
      total: result.total,
      limit: input.limit || 20,
      offset: input.offset || 0,
      hasMore: (input.offset || 0) + (input.limit || 20) < result.total
    } as MemoryListResult
  }
})

export const getOldestMemoriesTool = tool({
  description:
    "Get oldest memories. Use when user asks for 'oldest memories', 'first memories', or 'earliest memories'. Returns memories sorted by creation date (oldest first) with pagination support. Useful for finding the earliest created memories.",
  inputSchema: getOldestMemoriesToolSchema,
  execute: async (input: GetOldestMemoriesToolInput) => {
    const result = await getMemories({
      limit: input.limit || 20,
      offset: input.offset || 0,
      orderBy: { column: "createdAt", direction: "asc" }
    })
    return {
      memories: result.data,
      total: result.total,
      limit: input.limit || 20,
      offset: input.offset || 0,
      hasMore: (input.offset || 0) + (input.limit || 20) < result.total
    } as MemoryListResult
  }
})

export const getRecentMemoriesTool = tool({
  description:
    "Get recent memories from last N days. Use when user asks for 'recent memories', 'memories from last few days', or 'recent activity'. Retrieves memories created within the last N days (default: 7 days) with pagination support. Useful for finding recent memory activity.",
  inputSchema: getRecentMemoriesToolSchema,
  execute: async (input: GetRecentMemoriesToolInput) => {
    const days = input.days || 7
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const result = await getMemories({
      limit: input.limit || 20,
      offset: input.offset || 0,
      orderBy: { column: "createdAt", direction: "desc" }
    })
    return {
      memories: result.data,
      total: result.total,
      limit: input.limit || 20,
      offset: input.offset || 0,
      hasMore: (input.offset || 0) + (input.limit || 20) < result.total,
      filters: { days, cutoffDate: cutoffDate.toISOString() }
    } as MemoryListResult
  }
})

export const getMemoriesCountByImportanceTool = tool({
  description:
    "Get count of memories by importance level. Use when user asks for 'importance counts', 'how many high importance memories', or 'importance breakdown'. Generates a count breakdown of memories by importance level (low/medium/high/critical) with optional filtering. Returns counts for each importance and total.",
  inputSchema: getMemoriesCountByImportanceToolSchema,
  execute: async (input: GetMemoriesCountByImportanceToolInput) => {
    const importances = ["low", "medium", "high", "critical"]
    const counts = await Promise.all(
      importances.map(async (importance) => {
        const result = await getMemories({
          limit: 1,
          offset: 0,
          filters: {
            ...input.filters,
            importance: importance as "low" | "medium" | "high" | "critical"
          }
        })
        return { importance, count: result.total }
      })
    )

    return {
      counts,
      total: counts.reduce((sum, item) => sum + item.count, 0),
      filters: input.filters
    } as MemoryCountByImportance
  }
})

export const getMemoriesCountByDateTool = tool({
  description:
    "Get count of memories by date range. Use when user asks for 'memories count by date', 'how many memories this month', or 'date-based counts'. Counts memories created within a specific date range. Currently returns total count with note that date filtering is not yet implemented in the data access layer.",
  inputSchema: getMemoriesCountByDateToolSchema,
  execute: async (input: GetMemoriesCountByDateToolInput) => {
    const result = await getMemories({ limit: 1, offset: 0 })
    return {
      total: result.total,
      startDate: input.startDate,
      endDate: input.endDate,
      message: "Date range filtering not yet implemented in DAL"
    } as MemoryCountByDate
  }
})

export const memoryTools = {
  createMemory: createMemoryTool,
  updateMemory: updateMemoryTool,
  deleteMemory: deleteMemoryTool,
  listMemories: listMemoriesTool,
  getMemoryById: getMemoryByIdTool,
  searchMemories: searchMemoriesTool,
  getMemoriesStats: getMemoriesStatsTool,
  getMemoriesByImportance: getMemoriesByImportanceTool,
  getActiveMemories: getActiveMemoriesTool,
  getInactiveMemories: getInactiveMemoriesTool,
  getNewestMemories: getNewestMemoriesTool,
  getOldestMemories: getOldestMemoriesTool,
  getRecentMemories: getRecentMemoriesTool,
  getMemoriesCountByImportance: getMemoriesCountByImportanceTool,
  getMemoriesCountByDate: getMemoriesCountByDateTool,
  searchMemoriesSemantic: searchMemoriesSemanticTool,
  getRelevantMemories: getRelevantMemoriesTool
} as const

export type MemoryToolName = keyof typeof memoryTools
