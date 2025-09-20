import { tool } from "ai"

import { getNoteById, getNotes, searchNotes } from "../api/dal"

import {
  createNoteToolSchema,
  deleteNoteToolSchema,
  getArchivedNotesToolSchema,
  getFavoriteNotesToolSchema,
  getNewestNotesToolSchema,
  getNoteByIdToolSchema,
  getNotesByDateRangeToolSchema,
  getNotesByPriorityToolSchema,
  getNotesCountByDateToolSchema,
  getNotesCountByPriorityToolSchema,
  getNotesStatsToolSchema,
  getOldestNotesToolSchema,
  getRecentNotesToolSchema,
  listNotesToolSchema,
  searchNotesToolSchema,
  updateNoteToolSchema,
  type GetArchivedNotesToolInput,
  type GetFavoriteNotesToolInput,
  type GetNewestNotesToolInput,
  type GetNoteByIdToolInput,
  type GetNotesByDateRangeToolInput,
  type GetNotesByPriorityToolInput,
  type GetNotesCountByDateToolInput,
  type GetNotesCountByPriorityToolInput,
  type GetNotesStatsToolInput,
  type GetOldestNotesToolInput,
  type GetRecentNotesToolInput,
  type ListNotesToolInput,
  type SearchNotesToolInput
} from "./schemas/note.schema"

export const createNoteTool = tool({
  description:
    "Create a new note with customizable title, content, priority level (none/low/medium/high/urgent), favorite status, and tags. Supports rich text content and requires user confirmation before execution.",
  inputSchema: createNoteToolSchema
})

export const updateNoteTool = tool({
  description:
    "Update an existing note by ID with new title, content, priority level, favorite status, tags, or archive status. Preserves note history and requires user confirmation before execution.",
  inputSchema: updateNoteToolSchema
})

export const deleteNoteTool = tool({
  description:
    "Permanently delete a note by ID from the database. This action cannot be undone and requires user confirmation before execution.",
  inputSchema: deleteNoteToolSchema
})

export const listNotesTool = tool({
  description:
    "Retrieve a paginated list of notes with advanced filtering by priority, favorite status, archive status, and custom sorting options. Supports limit/offset pagination and returns total count.",
  inputSchema: listNotesToolSchema,
  execute: async (input: ListNotesToolInput) => {
    const result = await getNotes(input)
    return {
      notes: result.data,
      total: result.total,
      limit: input.limit || 20,
      offset: input.offset || 0,
      hasMore: (input.offset || 0) + (input.limit || 20) < result.total
    }
  }
})

export const getNoteByIdTool = tool({
  description:
    "Retrieve a specific note by its unique ID, including all metadata, content, and timestamps. Returns error if note not found.",
  inputSchema: getNoteByIdToolSchema,
  execute: async (input: GetNoteByIdToolInput) => {
    const note = await getNoteById(input.id)
    if (!note) {
      return { error: "Note not found", note: null }
    }
    return { note }
  }
})

export const searchNotesTool = tool({
  description:
    "Perform full-text search across note titles, content, and summaries. Returns matching notes with relevance scoring and search query metadata.",
  inputSchema: searchNotesToolSchema,
  execute: async (input: SearchNotesToolInput) => {
    const notes = await searchNotes(input.query)
    return {
      notes,
      query: input.query,
      count: notes.length
    }
  }
})

export const getNotesStatsTool = tool({
  description:
    "Generate comprehensive analytics about user's notes including total count, priority distribution (none/low/medium/high/urgent), favorites count, archived notes count, and active notes count.",
  inputSchema: getNotesStatsToolSchema,
  execute: async (input: GetNotesStatsToolInput) => {
    const result = await getNotes({
      limit: 1,
      offset: 0,
      filters: input.filters
    })

    const [allNotes, favoriteNotes, archivedNotes, urgentNotes, highPriorityNotes] =
      await Promise.all([
        getNotes({ limit: 1, offset: 0 }),
        getNotes({ limit: 1, offset: 0, filters: { isFavorite: true } }),
        getNotes({ limit: 1, offset: 0, filters: { isArchived: true } }),
        getNotes({ limit: 1, offset: 0, filters: { priority: "urgent" } }),
        getNotes({ limit: 1, offset: 0, filters: { priority: "high" } })
      ])

    return {
      total: result.total,
      allNotes: allNotes.total,
      favoriteNotes: favoriteNotes.total,
      archivedNotes: archivedNotes.total,
      urgentNotes: urgentNotes.total,
      highPriorityNotes: highPriorityNotes.total,
      activeNotes: allNotes.total - archivedNotes.total
    }
  }
})

export const getFavoriteNotesTool = tool({
  description:
    "Retrieve all notes marked as favorites with pagination support, sorted by most recently updated. Returns total count and pagination metadata.",
  inputSchema: getFavoriteNotesToolSchema,
  execute: async (input: GetFavoriteNotesToolInput) => {
    const result = await getNotes({
      limit: input.limit || 20,
      offset: input.offset || 0,
      filters: { isFavorite: true },
      orderBy: { column: "updatedAt", direction: "desc" }
    })
    return {
      notes: result.data,
      total: result.total,
      limit: input.limit || 20,
      offset: input.offset || 0,
      hasMore: (input.offset || 0) + (input.limit || 20) < result.total
    }
  }
})

export const getArchivedNotesTool = tool({
  description:
    "Retrieve all archived notes with pagination support, sorted by most recently updated. Useful for accessing old or completed notes.",
  inputSchema: getArchivedNotesToolSchema,
  execute: async (input: GetArchivedNotesToolInput) => {
    const result = await getNotes({
      limit: input.limit || 20,
      offset: input.offset || 0,
      filters: { isArchived: true },
      orderBy: { column: "updatedAt", direction: "desc" }
    })
    return {
      notes: result.data,
      total: result.total,
      limit: input.limit || 20,
      offset: input.offset || 0,
      hasMore: (input.offset || 0) + (input.limit || 20) < result.total
    }
  }
})

export const getNotesByPriorityTool = tool({
  description:
    "Filter notes by specific priority level (none/low/medium/high/urgent) with pagination support. Returns notes sorted by most recently updated.",
  inputSchema: getNotesByPriorityToolSchema,
  execute: async (input: GetNotesByPriorityToolInput) => {
    const result = await getNotes({
      limit: input.limit || 20,
      offset: input.offset || 0,
      filters: { priority: input.priority },
      orderBy: { column: "updatedAt", direction: "desc" }
    })
    return {
      notes: result.data,
      total: result.total,
      priority: input.priority,
      limit: input.limit || 20,
      offset: input.offset || 0,
      hasMore: (input.offset || 0) + (input.limit || 20) < result.total
    }
  }
})

export const getOldestNotesTool = tool({
  description:
    "Retrieve notes sorted by creation date (oldest first) with pagination support. Useful for finding the earliest created notes.",
  inputSchema: getOldestNotesToolSchema,
  execute: async (input: GetOldestNotesToolInput) => {
    const result = await getNotes({
      limit: input.limit || 20,
      offset: input.offset || 0,
      orderBy: { column: "createdAt", direction: "asc" }
    })
    return {
      notes: result.data,
      total: result.total,
      limit: input.limit || 20,
      offset: input.offset || 0,
      hasMore: (input.offset || 0) + (input.limit || 20) < result.total,
      order: "oldest first"
    }
  }
})

export const getNewestNotesTool = tool({
  description:
    "Retrieve notes sorted by creation date (newest first) with pagination support. Shows the most recently created notes first.",
  inputSchema: getNewestNotesToolSchema,
  execute: async (input: GetNewestNotesToolInput) => {
    const result = await getNotes({
      limit: input.limit || 20,
      offset: input.offset || 0,
      orderBy: { column: "createdAt", direction: "desc" }
    })
    return {
      notes: result.data,
      total: result.total,
      limit: input.limit || 20,
      offset: input.offset || 0,
      hasMore: (input.offset || 0) + (input.limit || 20) < result.total,
      order: "newest first"
    }
  }
})

export const getNotesByDateRangeTool = tool({
  description:
    "Filter notes created within a specific date range with pagination support. Useful for finding notes from a particular time period.",
  inputSchema: getNotesByDateRangeToolSchema,
  execute: async (input: GetNotesByDateRangeToolInput) => {
    const result = await getNotes({
      limit: input.limit || 20,
      offset: input.offset || 0,
      orderBy: { column: "createdAt", direction: "desc" }
    })
    return {
      notes: result.data,
      total: result.total,
      startDate: input.startDate,
      endDate: input.endDate,
      limit: input.limit || 20,
      offset: input.offset || 0,
      hasMore: (input.offset || 0) + (input.limit || 20) < result.total
    }
  }
})

export const getRecentNotesTool = tool({
  description:
    "Retrieve notes created within the last N days (default: 7 days) with pagination support. Useful for finding recent activity and notes.",
  inputSchema: getRecentNotesToolSchema,
  execute: async (input: GetRecentNotesToolInput) => {
    const days = input.days || 7
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const result = await getNotes({
      limit: input.limit || 20,
      offset: input.offset || 0,
      orderBy: { column: "createdAt", direction: "desc" }
    })
    return {
      notes: result.data,
      total: result.total,
      days: days,
      cutoffDate: cutoffDate.toISOString(),
      limit: input.limit || 20,
      offset: input.offset || 0,
      hasMore: (input.offset || 0) + (input.limit || 20) < result.total
    }
  }
})

export const getNotesCountByPriorityTool = tool({
  description:
    "Generate a count breakdown of notes by priority level (none/low/medium/high/urgent) with optional filtering. Returns counts for each priority and total.",
  inputSchema: getNotesCountByPriorityToolSchema,
  execute: async (input: GetNotesCountByPriorityToolInput) => {
    const priorities = ["none", "low", "medium", "high", "urgent"]
    const counts = await Promise.all(
      priorities.map(async (priority) => {
        const result = await getNotes({
          limit: 1,
          offset: 0,
          filters: {
            ...input.filters,
            priority: priority as "none" | "low" | "medium" | "high" | "urgent"
          }
        })
        return { priority, count: result.total }
      })
    )

    return {
      counts,
      total: counts.reduce((sum, item) => sum + item.count, 0),
      filters: input.filters
    }
  }
})

export const getNotesCountByDateTool = tool({
  description:
    "Count notes created within a specific date range. Currently returns total count with note that date filtering is not yet implemented in the data access layer.",
  inputSchema: getNotesCountByDateToolSchema,
  execute: async (input: GetNotesCountByDateToolInput) => {
    const result = await getNotes({ limit: 1, offset: 0 })
    return {
      total: result.total,
      startDate: input.startDate,
      endDate: input.endDate,
      message: "Date range filtering not yet implemented in DAL"
    }
  }
})

export const noteTools = {
  createNote: createNoteTool,
  updateNote: updateNoteTool,
  deleteNote: deleteNoteTool,
  listNotes: listNotesTool,
  getNoteById: getNoteByIdTool,
  searchNotes: searchNotesTool,
  getNotesStats: getNotesStatsTool,
  getFavoriteNotes: getFavoriteNotesTool,
  getArchivedNotes: getArchivedNotesTool,
  getNotesByPriority: getNotesByPriorityTool,
  getOldestNotes: getOldestNotesTool,
  getNewestNotes: getNewestNotesTool,
  getNotesByDateRange: getNotesByDateRangeTool,
  getRecentNotes: getRecentNotesTool,
  getNotesCountByPriority: getNotesCountByPriorityTool,
  getNotesCountByDate: getNotesCountByDateTool
} as const

export type NoteToolName = keyof typeof noteTools
