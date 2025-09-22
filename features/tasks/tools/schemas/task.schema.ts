import { z } from "zod"

export const createTaskToolSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  description: z.string().optional(),
  status: z.enum(["pending", "inProgress", "completed", "cancelled", "onHold"]).default("pending"),
  priority: z.enum(["none", "low", "medium", "high", "urgent"]).default("none"),
  dueDate: z.string().optional(),
  estimatedDuration: z.number().int().min(0).optional(),
  parentTaskId: z.uuid("Invalid parent task ID format").optional()
})

export const updateTaskToolSchema = z.object({
  id: z.uuid("Invalid task ID format"),
  title: z
    .string()
    .min(1, "Title is REQUIRED - always include the title field when updating")
    .max(255, "Title must be less than 255 characters"),
  description: z.string().optional(),
  status: z.enum(["pending", "inProgress", "completed", "cancelled", "onHold"]).optional(),
  priority: z.enum(["none", "low", "medium", "high", "urgent"]).optional(),
  dueDate: z.string().optional(),
  estimatedDuration: z.number().int().min(0).optional(),
  parentTaskId: z.uuid("Invalid parent task ID format").optional()
})

export const deleteTaskToolSchema = z.object({
  id: z.uuid("Invalid task ID format"),
  title: z
    .string()
    .min(1, "Title is REQUIRED - always include the title field when deleting")
    .max(255, "Title must be less than 255 characters"),
  description: z.string().optional(),
  status: z.enum(["pending", "inProgress", "completed", "cancelled", "onHold"]).optional(),
  priority: z.enum(["none", "low", "medium", "high", "urgent"]).optional(),
  dueDate: z.string().optional(),
  estimatedDuration: z.number().int().min(0).optional(),
  parentTaskId: z.uuid("Invalid parent task ID format").optional()
})

export const listTasksToolSchema = z.object({
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional(),
  orderBy: z
    .object({
      column: z.enum([
        "createdAt",
        "updatedAt",
        "title",
        "status",
        "priority",
        "dueDate",
        "position"
      ]),
      direction: z.enum(["asc", "desc"])
    })
    .optional(),
  filters: z
    .object({
      search: z.string().optional(),
      status: z
        .union([
          z.enum(["pending", "inProgress", "completed", "cancelled", "onHold"]),
          z.array(z.enum(["pending", "inProgress", "completed", "cancelled", "onHold"]))
        ])
        .optional(),
      priority: z
        .union([
          z.enum(["none", "low", "medium", "high", "urgent"]),
          z.array(z.enum(["none", "low", "medium", "high", "urgent"]))
        ])
        .optional(),
      dueDate: z
        .object({
          from: z.string().optional(),
          to: z.string().optional()
        })
        .optional(),
      parentTaskId: z.uuid().nullable().optional(),
      hasSubtasks: z.boolean().optional()
    })
    .optional()
})

export const getTaskByIdToolSchema = z.object({
  id: z.uuid("Invalid task ID format")
})

export const searchTasksToolSchema = z.object({
  query: z.string().min(1, "Search query is required")
})

export const getTasksByStatusToolSchema = z.object({
  status: z.enum(["pending", "inProgress", "completed", "cancelled", "onHold"]),
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional()
})

export const getTasksByPriorityToolSchema = z.object({
  priority: z.enum(["none", "low", "medium", "high", "urgent"]),
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional()
})

export const getTasksByDateRangeToolSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional()
})

export const getOverdueTasksToolSchema = z.object({
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional()
})

export const getDueSoonTasksToolSchema = z.object({
  days: z.number().min(1).max(30).default(7).optional(),
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional()
})

export const getCompletedTasksToolSchema = z.object({
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional()
})

export const getPendingTasksToolSchema = z.object({
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional()
})

export const getInProgressTasksToolSchema = z.object({
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional()
})

export const getMainTasksOnlyToolSchema = z.object({
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional()
})

export const getSubtasksOnlyToolSchema = z.object({
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional()
})

export const getTasksByParentIdToolSchema = z.object({
  parentId: z.uuid("Invalid parent task ID format"),
  limit: z.number().min(1).max(100).default(20).optional(),
  offset: z.number().min(0).default(0).optional()
})

export const getTaskHierarchyToolSchema = z.object({
  taskId: z.uuid("Invalid task ID format")
})

export const validateTaskHierarchyToolSchema = z.object({
  taskId: z.uuid("Invalid task ID format"),
  parentTaskId: z.uuid("Invalid parent task ID format").optional()
})

export const promoteSubtaskToMainToolSchema = z.object({
  taskId: z.uuid("Invalid task ID format")
})

export const demoteMainToSubtaskToolSchema = z.object({
  taskId: z.uuid("Invalid task ID format"),
  parentTaskId: z.uuid("Invalid parent task ID format")
})

export const createTaskFromDescriptionToolSchema = z.object({
  description: z.string().min(1, "Description is required"),
  parentTaskId: z.uuid("Invalid parent task ID format").optional()
})

export const createTaskWithSubtasksToolSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  description: z.string().optional(),
  status: z.enum(["pending", "inProgress", "completed", "cancelled", "onHold"]).default("pending"),
  priority: z.enum(["none", "low", "medium", "high", "urgent"]).default("none"),
  dueDate: z.string().optional(),
  estimatedDuration: z.number().int().min(0).optional(),
  subtasks: z
    .array(
      z.object({
        title: z
          .string()
          .min(1, "Subtask title is required")
          .max(255, "Subtask title must be less than 255 characters"),
        description: z.string().optional(),
        status: z
          .enum(["pending", "inProgress", "completed", "cancelled", "onHold"])
          .default("pending"),
        priority: z.enum(["none", "low", "medium", "high", "urgent"]).default("none"),
        dueDate: z.string().optional(),
        estimatedDuration: z.number().int().min(0).optional()
      })
    )
    .min(1, "At least one subtask is required")
})

export const suggestTaskBreakdownToolSchema = z.object({
  taskDescription: z.string().min(1, "Task description is required"),
  numberOfSubtasks: z.number().int().min(2).max(10).default(3).optional()
})

export const validateTaskDependenciesToolSchema = z.object({
  taskId: z.uuid("Invalid task ID format")
})

export const reorderTaskToolSchema = z.object({
  taskId: z.uuid("Invalid task ID format"),
  newPosition: z.number().int().min(0, "Position must be a non-negative integer"),
  newStatus: z.enum(["pending", "inProgress", "completed", "cancelled", "onHold"]).optional()
})

export const moveTaskToStatusToolSchema = z.object({
  taskId: z.uuid("Invalid task ID format"),
  status: z.enum(["pending", "inProgress", "completed", "cancelled", "onHold"])
})

export const getTasksForKanbanToolSchema = z.object({
  limit: z.number().min(1).max(100).default(50).optional()
})

export const bulkUpdateTaskStatusToolSchema = z.object({
  taskIds: z.array(z.uuid("Invalid task ID format")).min(1, "At least one task ID is required"),
  status: z.enum(["pending", "inProgress", "completed", "cancelled", "onHold"])
})

export const getTasksStatsToolSchema = z.object({
  filters: z
    .object({
      status: z
        .union([
          z.enum(["pending", "inProgress", "completed", "cancelled", "onHold"]),
          z.array(z.enum(["pending", "inProgress", "completed", "cancelled", "onHold"]))
        ])
        .optional(),
      priority: z
        .union([
          z.enum(["none", "low", "medium", "high", "urgent"]),
          z.array(z.enum(["none", "low", "medium", "high", "urgent"]))
        ])
        .optional(),
      dueDate: z
        .object({
          from: z.string().optional(),
          to: z.string().optional()
        })
        .optional()
    })
    .optional()
})

export const getTasksCountByStatusToolSchema = z.object({
  filters: z
    .object({
      priority: z
        .union([
          z.enum(["none", "low", "medium", "high", "urgent"]),
          z.array(z.enum(["none", "low", "medium", "high", "urgent"]))
        ])
        .optional(),
      dueDate: z
        .object({
          from: z.string().optional(),
          to: z.string().optional()
        })
        .optional()
    })
    .optional()
})

export const getTasksCountByPriorityToolSchema = z.object({
  filters: z
    .object({
      status: z
        .union([
          z.enum(["pending", "inProgress", "completed", "cancelled", "onHold"]),
          z.array(z.enum(["pending", "inProgress", "completed", "cancelled", "onHold"]))
        ])
        .optional(),
      dueDate: z
        .object({
          from: z.string().optional(),
          to: z.string().optional()
        })
        .optional()
    })
    .optional()
})

export const getTasksCountByDateToolSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional()
})

export const getTasksCompletionRateToolSchema = z.object({
  filters: z
    .object({
      status: z
        .union([
          z.enum(["pending", "inProgress", "completed", "cancelled", "onHold"]),
          z.array(z.enum(["pending", "inProgress", "completed", "cancelled", "onHold"]))
        ])
        .optional(),
      priority: z
        .union([
          z.enum(["none", "low", "medium", "high", "urgent"]),
          z.array(z.enum(["none", "low", "medium", "high", "urgent"]))
        ])
        .optional()
    })
    .optional()
})

export const getTasksAverageCompletionTimeToolSchema = z.object({
  filters: z
    .object({
      status: z
        .union([
          z.enum(["pending", "inProgress", "completed", "cancelled", "onHold"]),
          z.array(z.enum(["pending", "inProgress", "completed", "cancelled", "onHold"]))
        ])
        .optional(),
      priority: z
        .union([
          z.enum(["none", "low", "medium", "high", "urgent"]),
          z.array(z.enum(["none", "low", "medium", "high", "urgent"]))
        ])
        .optional()
    })
    .optional()
})

export const getTasksProductivityStatsToolSchema = z.object({
  period: z.enum(["day", "week", "month", "year"]).default("week").optional(),
  filters: z
    .object({
      status: z
        .union([
          z.enum(["pending", "inProgress", "completed", "cancelled", "onHold"]),
          z.array(z.enum(["pending", "inProgress", "completed", "cancelled", "onHold"]))
        ])
        .optional(),
      priority: z
        .union([
          z.enum(["none", "low", "medium", "high", "urgent"]),
          z.array(z.enum(["none", "low", "medium", "high", "urgent"]))
        ])
        .optional()
    })
    .optional()
})

export type CreateTaskToolInput = z.infer<typeof createTaskToolSchema>
export type UpdateTaskToolInput = z.infer<typeof updateTaskToolSchema>
export type DeleteTaskToolInput = z.infer<typeof deleteTaskToolSchema>
export type ListTasksToolInput = z.infer<typeof listTasksToolSchema>
export type GetTaskByIdToolInput = z.infer<typeof getTaskByIdToolSchema>
export type SearchTasksToolInput = z.infer<typeof searchTasksToolSchema>
export type GetTasksByStatusToolInput = z.infer<typeof getTasksByStatusToolSchema>
export type GetTasksByPriorityToolInput = z.infer<typeof getTasksByPriorityToolSchema>
export type GetTasksByDateRangeToolInput = z.infer<typeof getTasksByDateRangeToolSchema>
export type GetOverdueTasksToolInput = z.infer<typeof getOverdueTasksToolSchema>
export type GetDueSoonTasksToolInput = z.infer<typeof getDueSoonTasksToolSchema>
export type GetCompletedTasksToolInput = z.infer<typeof getCompletedTasksToolSchema>
export type GetPendingTasksToolInput = z.infer<typeof getPendingTasksToolSchema>
export type GetInProgressTasksToolInput = z.infer<typeof getInProgressTasksToolSchema>
export type GetMainTasksOnlyToolInput = z.infer<typeof getMainTasksOnlyToolSchema>
export type GetSubtasksOnlyToolInput = z.infer<typeof getSubtasksOnlyToolSchema>
export type GetTasksByParentIdToolInput = z.infer<typeof getTasksByParentIdToolSchema>
export type GetTaskHierarchyToolInput = z.infer<typeof getTaskHierarchyToolSchema>
export type ValidateTaskHierarchyToolInput = z.infer<typeof validateTaskHierarchyToolSchema>
export type PromoteSubtaskToMainToolInput = z.infer<typeof promoteSubtaskToMainToolSchema>
export type DemoteMainToSubtaskToolInput = z.infer<typeof demoteMainToSubtaskToolSchema>
export type CreateTaskFromDescriptionToolInput = z.infer<typeof createTaskFromDescriptionToolSchema>
export type CreateTaskWithSubtasksToolInput = z.infer<typeof createTaskWithSubtasksToolSchema>
export type SuggestTaskBreakdownToolInput = z.infer<typeof suggestTaskBreakdownToolSchema>
export type ValidateTaskDependenciesToolInput = z.infer<typeof validateTaskDependenciesToolSchema>
export type ReorderTaskToolInput = z.infer<typeof reorderTaskToolSchema>
export type MoveTaskToStatusToolInput = z.infer<typeof moveTaskToStatusToolSchema>
export type GetTasksForKanbanToolInput = z.infer<typeof getTasksForKanbanToolSchema>
export type BulkUpdateTaskStatusToolInput = z.infer<typeof bulkUpdateTaskStatusToolSchema>
export type GetTasksStatsToolInput = z.infer<typeof getTasksStatsToolSchema>
export type GetTasksCountByStatusToolInput = z.infer<typeof getTasksCountByStatusToolSchema>
export type GetTasksCountByPriorityToolInput = z.infer<typeof getTasksCountByPriorityToolSchema>
export type GetTasksCountByDateToolInput = z.infer<typeof getTasksCountByDateToolSchema>
export type GetTasksCompletionRateToolInput = z.infer<typeof getTasksCompletionRateToolSchema>
export type GetTasksAverageCompletionTimeToolInput = z.infer<
  typeof getTasksAverageCompletionTimeToolSchema
>
export type GetTasksProductivityStatsToolInput = z.infer<typeof getTasksProductivityStatsToolSchema>

export const APPROVAL = {
  YES: "APPROVED",
  NO: "REJECTED"
} as const

export type ApprovalStatus = (typeof APPROVAL)[keyof typeof APPROVAL]
