import { tool } from "ai"

import {
  getTaskById,
  getTasks,
  getTasksByParentId,
  reorderTask,
  searchTasks,
  updateTask,
  updateTaskStatus
} from "../api/dal"

import {
  createTaskToolSchema,
  deleteTaskToolSchema,
  getCompletedTasksToolSchema,
  getDueSoonTasksToolSchema,
  getInProgressTasksToolSchema,
  getMainTasksOnlyToolSchema,
  getOverdueTasksToolSchema,
  getPendingTasksToolSchema,
  getSubtasksOnlyToolSchema,
  getTaskByIdToolSchema,
  getTaskHierarchyToolSchema,
  getTasksByDateRangeToolSchema,
  getTasksByParentIdToolSchema,
  getTasksByPriorityToolSchema,
  getTasksByStatusToolSchema,
  getTasksCompletionRateToolSchema,
  getTasksCountByDateToolSchema,
  getTasksCountByPriorityToolSchema,
  getTasksCountByStatusToolSchema,
  getTasksForKanbanToolSchema,
  getTasksProductivityStatsToolSchema,
  getTasksStatsToolSchema,
  listTasksToolSchema,
  moveTaskToStatusToolSchema,
  promoteSubtaskToMainToolSchema,
  reorderTaskToolSchema,
  searchTasksToolSchema,
  updateTaskToolSchema,
  validateTaskHierarchyToolSchema,
  type GetCompletedTasksToolInput,
  type GetDueSoonTasksToolInput,
  type GetInProgressTasksToolInput,
  type GetMainTasksOnlyToolInput,
  type GetOverdueTasksToolInput,
  type GetPendingTasksToolInput,
  type GetSubtasksOnlyToolInput,
  type GetTaskByIdToolInput,
  type GetTaskHierarchyToolInput,
  type GetTasksByDateRangeToolInput,
  type GetTasksByParentIdToolInput,
  type GetTasksByPriorityToolInput,
  type GetTasksByStatusToolInput,
  type GetTasksCompletionRateToolInput,
  type GetTasksCountByDateToolInput,
  type GetTasksCountByPriorityToolInput,
  type GetTasksCountByStatusToolInput,
  type GetTasksForKanbanToolInput,
  type GetTasksProductivityStatsToolInput,
  type GetTasksStatsToolInput,
  type ListTasksToolInput,
  type MoveTaskToStatusToolInput,
  type PromoteSubtaskToMainToolInput,
  type ReorderTaskToolInput,
  type SearchTasksToolInput,
  type ValidateTaskHierarchyToolInput
} from "./schemas/task.schema"

import type {
  TaskHierarchyResult,
  TaskListResult,
  TaskSearchResult,
  TaskStats
} from "./types/task.types"

import type { TaskFilters, TaskPriority, TaskStatus } from "../types/task.types"

type InputTaskFilters = {
  search?: string
  status?: TaskStatus | TaskStatus[]
  priority?: TaskPriority | TaskPriority[]
  dueDate?: {
    from?: string
    to?: string
  }
  parentTaskId?: string | null
  hasSubtasks?: boolean
}

function convertFilters(filters: InputTaskFilters | undefined): TaskFilters | undefined {
  if (!filters) return filters

  const converted: TaskFilters = {
    search: filters.search,
    status: filters.status,
    priority: filters.priority,
    parentTaskId: filters.parentTaskId,
    hasSubtasks: filters.hasSubtasks,
    dueDate: filters.dueDate
      ? {
          from: filters.dueDate.from ? new Date(filters.dueDate.from) : undefined,
          to: filters.dueDate.to ? new Date(filters.dueDate.to) : undefined
        }
      : undefined
  }

  return converted
}

export const createTaskTool = tool({
  description:
    "Create a new task. Use when user wants to create/save a new task. REQUIRED: title (string). OPTIONAL: description, status (pending/inProgress/completed/cancelled/onHold), priority (none/low/medium/high/urgent), dueDate (ISO string), estimatedDuration (minutes), parentTaskId (UUID for subtasks). Supports hierarchical parent-child relationships and requires user confirmation before execution.",
  inputSchema: createTaskToolSchema
})

export const updateTaskTool = tool({
  description:
    "Update an existing task by ID. Use when user wants to modify/edit an existing task. REQUIRED: id (UUID), title (string - use existing title if user doesn't specify new one). OPTIONAL: description, status, priority, dueDate, estimatedDuration, parentTaskId. Preserves task history and requires user confirmation before execution.",
  inputSchema: updateTaskToolSchema
})

export const deleteTaskTool = tool({
  description:
    "Permanently delete a task by ID. Use when user wants to remove/delete a task completely. REQUIRED: id (UUID), title (string). OPTIONAL: description, status, priority, dueDate, estimatedDuration, parentTaskId. This action cannot be undone and requires user confirmation before execution.",
  inputSchema: deleteTaskToolSchema
})

export const listTasksTool = tool({
  description:
    "Retrieve a paginated list of tasks with advanced filtering. Use when user wants to see all tasks or filtered tasks. Supports filtering by status, priority, due date, parent-child relationships, and custom sorting options. Supports limit/offset pagination and returns total count.",
  inputSchema: listTasksToolSchema,
  execute: async (input: ListTasksToolInput) => {
    const result = await getTasks({
      ...input,
      filters: convertFilters(input.filters as InputTaskFilters)
    })
    return {
      tasks: result.data,
      total: result.total,
      limit: input.limit || 20,
      offset: input.offset || 0,
      hasMore: (input.offset || 0) + (input.limit || 20) < result.total,
      filters: input.filters
    } as TaskListResult
  }
})

export const getTaskByIdTool = tool({
  description:
    "Retrieve a specific task by its unique ID. Use when user wants to view details of a specific task. Returns all metadata, content, and timestamps. Returns error if task not found.",
  inputSchema: getTaskByIdToolSchema,
  execute: async (input: GetTaskByIdToolInput) => {
    const task = await getTaskById(input.id)
    if (!task) {
      return { error: "Task not found", task: null }
    }
    return { task }
  }
})

export const searchTasksTool = tool({
  description:
    "Search for tasks by text content. Use when user wants to find tasks containing specific words or phrases. Performs full-text search across task titles and descriptions. Returns matching tasks with relevance scoring and search query metadata.",
  inputSchema: searchTasksToolSchema,
  execute: async (input: SearchTasksToolInput) => {
    const tasks = await searchTasks(input.query)
    return {
      tasks,
      query: input.query,
      count: tasks.length
    } as TaskSearchResult
  }
})

export const getTasksByStatusTool = tool({
  description:
    "Get tasks by status. Use when user asks for 'pending tasks', 'completed tasks', 'in progress tasks', etc. Filters tasks by specific status (pending/inProgress/completed/cancelled/onHold) with pagination support. Returns tasks sorted by most recently updated.",
  inputSchema: getTasksByStatusToolSchema,
  execute: async (input: GetTasksByStatusToolInput) => {
    const result = await getTasks({
      limit: input.limit || 20,
      offset: input.offset || 0,
      filters: { status: input.status },
      orderBy: { column: "updatedAt", direction: "desc" }
    })
    return {
      tasks: result.data,
      total: result.total,
      limit: input.limit || 20,
      offset: input.offset || 0,
      hasMore: (input.offset || 0) + (input.limit || 20) < result.total,
      filters: { status: input.status }
    } as TaskListResult
  }
})

export const getTasksByPriorityTool = tool({
  description:
    "Get tasks by priority level. Use when user asks for 'high priority tasks', 'urgent tasks', 'low priority tasks', etc. Filters tasks by specific priority level (none/low/medium/high/urgent) with pagination support. Returns tasks sorted by most recently updated.",
  inputSchema: getTasksByPriorityToolSchema,
  execute: async (input: GetTasksByPriorityToolInput) => {
    const result = await getTasks({
      limit: input.limit || 20,
      offset: input.offset || 0,
      filters: { priority: input.priority },
      orderBy: { column: "updatedAt", direction: "desc" }
    })
    return {
      tasks: result.data,
      total: result.total,
      limit: input.limit || 20,
      offset: input.offset || 0,
      hasMore: (input.offset || 0) + (input.limit || 20) < result.total,
      filters: { priority: input.priority }
    } as TaskListResult
  }
})

export const getTasksByDateRangeTool = tool({
  description:
    "Get tasks by date range. Use when user asks for tasks from 'last week', 'this month', 'between dates', or specific time periods. Filters tasks created within a specific date range with pagination support. Useful for finding tasks from a particular time period.",
  inputSchema: getTasksByDateRangeToolSchema,
  execute: async (input: GetTasksByDateRangeToolInput) => {
    const filters: TaskFilters = {}
    if (input.startDate) {
      filters.dueDate = { ...filters.dueDate, from: new Date(input.startDate) }
    }
    if (input.endDate) {
      filters.dueDate = { ...filters.dueDate, to: new Date(input.endDate) }
    }

    const result = await getTasks({
      limit: input.limit || 20,
      offset: input.offset || 0,
      filters: filters,
      orderBy: { column: "createdAt", direction: "desc" }
    })
    return {
      tasks: result.data,
      total: result.total,
      limit: input.limit || 20,
      offset: input.offset || 0,
      hasMore: (input.offset || 0) + (input.limit || 20) < result.total,
      filters: {
        dueDate: {
          from: input.startDate ? new Date(input.startDate) : undefined,
          to: input.endDate ? new Date(input.endDate) : undefined
        }
      }
    } as TaskListResult
  }
})

export const getOverdueTasksTool = tool({
  description:
    "Get overdue tasks. Use when user asks for 'overdue tasks', 'late tasks', or 'past due tasks'. Returns tasks that are past their due date and not completed. Useful for identifying tasks that need immediate attention.",
  inputSchema: getOverdueTasksToolSchema,
  execute: async (input: GetOverdueTasksToolInput) => {
    const now = new Date()
    const result = await getTasks({
      limit: input.limit || 20,
      offset: input.offset || 0,
      filters: {
        dueDate: { to: now },
        status: ["pending", "inProgress", "onHold"]
      },
      orderBy: { column: "dueDate", direction: "asc" }
    })
    return {
      tasks: result.data,
      total: result.total,
      limit: input.limit || 20,
      offset: input.offset || 0,
      hasMore: (input.offset || 0) + (input.limit || 20) < result.total,
      type: "overdue"
    }
  }
})

export const getDueSoonTasksTool = tool({
  description:
    "Get tasks due soon. Use when user asks for 'tasks due soon', 'upcoming tasks', or 'tasks due in X days'. Returns tasks due within the specified number of days (default: 7 days) and not completed. Useful for planning and prioritization.",
  inputSchema: getDueSoonTasksToolSchema,
  execute: async (input: GetDueSoonTasksToolInput) => {
    const days = input.days || 7
    const now = new Date()
    const futureDate = new Date()
    futureDate.setDate(now.getDate() + days)

    const result = await getTasks({
      limit: input.limit || 20,
      offset: input.offset || 0,
      filters: {
        dueDate: { from: now, to: futureDate },
        status: ["pending", "inProgress", "onHold"]
      },
      orderBy: { column: "dueDate", direction: "asc" }
    })
    return {
      tasks: result.data,
      total: result.total,
      days: days,
      limit: input.limit || 20,
      offset: input.offset || 0,
      hasMore: (input.offset || 0) + (input.limit || 20) < result.total,
      type: "dueSoon"
    }
  }
})

export const getCompletedTasksTool = tool({
  description:
    "Get completed tasks. Use when user asks for 'completed tasks', 'finished tasks', or 'done tasks'. Returns all tasks with completed status with pagination support, sorted by most recently completed.",
  inputSchema: getCompletedTasksToolSchema,
  execute: async (input: GetCompletedTasksToolInput) => {
    const result = await getTasks({
      limit: input.limit || 20,
      offset: input.offset || 0,
      filters: { status: "completed" },
      orderBy: { column: "updatedAt", direction: "desc" }
    })
    return {
      tasks: result.data,
      total: result.total,
      limit: input.limit || 20,
      offset: input.offset || 0,
      hasMore: (input.offset || 0) + (input.limit || 20) < result.total,
      type: "completed"
    }
  }
})

export const getPendingTasksTool = tool({
  description:
    "Get pending tasks. Use when user asks for 'pending tasks', 'new tasks', or 'not started tasks'. Returns all tasks with pending status with pagination support, sorted by most recently created.",
  inputSchema: getPendingTasksToolSchema,
  execute: async (input: GetPendingTasksToolInput) => {
    const result = await getTasks({
      limit: input.limit || 20,
      offset: input.offset || 0,
      filters: { status: "pending" },
      orderBy: { column: "createdAt", direction: "desc" }
    })
    return {
      tasks: result.data,
      total: result.total,
      limit: input.limit || 20,
      offset: input.offset || 0,
      hasMore: (input.offset || 0) + (input.limit || 20) < result.total,
      type: "pending"
    }
  }
})

export const getInProgressTasksTool = tool({
  description:
    "Get in-progress tasks. Use when user asks for 'in progress tasks', 'active tasks', or 'working tasks'. Returns all tasks with inProgress status with pagination support, sorted by most recently updated.",
  inputSchema: getInProgressTasksToolSchema,
  execute: async (input: GetInProgressTasksToolInput) => {
    const result = await getTasks({
      limit: input.limit || 20,
      offset: input.offset || 0,
      filters: { status: "inProgress" },
      orderBy: { column: "updatedAt", direction: "desc" }
    })
    return {
      tasks: result.data,
      total: result.total,
      limit: input.limit || 20,
      offset: input.offset || 0,
      hasMore: (input.offset || 0) + (input.limit || 20) < result.total,
      type: "inProgress"
    }
  }
})

export const getMainTasksOnlyTool = tool({
  description:
    "Get main tasks only (parent tasks). Use when user asks for 'main tasks', 'parent tasks', or 'top-level tasks'. Returns only tasks that are not subtasks (parentTaskId is null) with pagination support.",
  inputSchema: getMainTasksOnlyToolSchema,
  execute: async (input: GetMainTasksOnlyToolInput) => {
    const result = await getTasks({
      limit: input.limit || 20,
      offset: input.offset || 0,
      filters: { parentTaskId: null },
      orderBy: { column: "updatedAt", direction: "desc" }
    })
    return {
      tasks: result.data,
      total: result.total,
      limit: input.limit || 20,
      offset: input.offset || 0,
      hasMore: (input.offset || 0) + (input.limit || 20) < result.total,
      type: "mainTasks"
    }
  }
})

export const getSubtasksOnlyTool = tool({
  description:
    "Get subtasks only. Use when user asks for 'subtasks', 'child tasks', or 'nested tasks'. Returns only tasks that are subtasks (have a parentTaskId) with pagination support.",
  inputSchema: getSubtasksOnlyToolSchema,
  execute: async (input: GetSubtasksOnlyToolInput) => {
    const result = await getTasks({
      limit: input.limit || 20,
      offset: input.offset || 0,
      filters: { parentTaskId: null },
      orderBy: { column: "updatedAt", direction: "desc" }
    })
    return {
      tasks: result.data,
      total: result.total,
      limit: input.limit || 20,
      offset: input.offset || 0,
      hasMore: (input.offset || 0) + (input.limit || 20) < result.total,
      type: "subtasks"
    }
  }
})

export const getTasksByParentIdTool = tool({
  description:
    "Get subtasks by parent task ID. Use when user wants to see all subtasks of a specific parent task. Returns all tasks that have the specified parentTaskId with pagination support.",
  inputSchema: getTasksByParentIdToolSchema,
  execute: async (input: GetTasksByParentIdToolInput) => {
    const subtasks = await getTasksByParentId(input.parentId)
    const total = subtasks.length
    const limit = input.limit || 20
    const offset = input.offset || 0
    const paginatedTasks = subtasks.slice(offset, offset + limit)

    return {
      tasks: paginatedTasks,
      total,
      parentId: input.parentId,
      limit,
      offset,
      hasMore: offset + limit < total,
      type: "subtasks"
    }
  }
})

export const getTaskHierarchyTool = tool({
  description:
    "Get task hierarchy (task with its subtasks). Use when user wants to see a task and all its subtasks together. Returns the main task and all its subtasks in a hierarchical structure.",
  inputSchema: getTaskHierarchyToolSchema,
  execute: async (input: GetTaskHierarchyToolInput) => {
    const [task, subtasks] = await Promise.all([
      getTaskById(input.taskId),
      getTasksByParentId(input.taskId)
    ])

    if (!task) {
      return { error: "Task not found", task: null, subtasks: [] }
    }

    return {
      task,
      subtasks,
      hasSubtasks: subtasks.length > 0,
      isSubtask: !!task.parentTaskId,
      parentTask: task.parentTaskId ? await getTaskById(task.parentTaskId) : null
    } as TaskHierarchyResult
  }
})

export const validateTaskHierarchyTool = tool({
  description:
    "Validate task hierarchy constraints. Use when user wants to check if a task can be moved or if hierarchy rules are violated. Validates single-level hierarchy, circular references, and parent-child relationships.",
  inputSchema: validateTaskHierarchyToolSchema,
  execute: async (input: ValidateTaskHierarchyToolInput) => {
    const task = await getTaskById(input.taskId)
    if (!task) {
      return {
        isValid: false,
        errors: ["Task not found"],
        warnings: []
      }
    }

    const errors: string[] = []
    const warnings: string[] = []

    if (task.parentTaskId && input.parentTaskId) {
      errors.push("A subtask cannot become a parent task")
    }

    if (input.parentTaskId === input.taskId) {
      errors.push("A task cannot be its own parent")
    }

    if (input.parentTaskId) {
      const parentTask = await getTaskById(input.parentTaskId)
      if (!parentTask) {
        errors.push("Parent task not found")
      } else if (parentTask.parentTaskId) {
        errors.push(
          "Cannot assign subtask to another subtask (only single-level hierarchy allowed)"
        )
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }
})

export const promoteSubtaskToMainTool = tool({
  description:
    "Promote a subtask to a main task. Use when user wants to convert a subtask to a main task (remove parent relationship). This makes the task a top-level task.",
  inputSchema: promoteSubtaskToMainToolSchema,
  execute: async (input: PromoteSubtaskToMainToolInput) => {
    const task = await getTaskById(input.taskId)
    if (!task) {
      return { error: "Task not found", task: null }
    }

    if (!task.parentTaskId) {
      return { error: "Task is already a main task", task }
    }

    const updatedTask = await updateTask(input.taskId, { parentTaskId: null })
    return {
      task: updatedTask,
      message: "Task promoted to main task successfully"
    }
  }
})

export const reorderTaskTool = tool({
  description:
    "Reorder a task's position. Use when user wants to change the order of tasks in a kanban board or list. Updates the task's position and optionally changes its status.",
  inputSchema: reorderTaskToolSchema,
  execute: async (input: ReorderTaskToolInput) => {
    const task = await reorderTask(input.taskId, input.newPosition, input.newStatus)
    if (!task) {
      return { error: "Task not found or reorder failed", task: null }
    }
    return {
      task,
      message: "Task reordered successfully"
    }
  }
})

export const moveTaskToStatusTool = tool({
  description:
    "Move a task to a different status. Use when user wants to change a task's status (e.g., from pending to inProgress). Updates the task status and completion timestamp if applicable.",
  inputSchema: moveTaskToStatusToolSchema,
  execute: async (input: MoveTaskToStatusToolInput) => {
    const task = await updateTaskStatus(input.taskId, input.status)
    if (!task) {
      return { error: "Task not found or status update failed", task: null }
    }
    return {
      task,
      message: `Task moved to ${input.status} status successfully`
    }
  }
})

export const getTasksForKanbanTool = tool({
  description:
    "Get tasks organized for kanban board display. Use when user wants to see tasks organized by status columns for kanban view. Returns tasks grouped by status with position information.",
  inputSchema: getTasksForKanbanToolSchema,
  execute: async (input: GetTasksForKanbanToolInput) => {
    const statuses = ["pending", "inProgress", "completed", "cancelled", "onHold"]
    const columns = await Promise.all(
      statuses.map(async (status) => {
        const result = await getTasks({
          limit: input.limit || 50,
          offset: 0,
          filters: { status: status as TaskStatus },
          orderBy: { column: "position", direction: "asc" }
        })
        return {
          status,
          tasks: result.data,
          count: result.data.length
        }
      })
    )

    const totalTasks = columns.reduce((sum, col) => sum + col.count, 0)

    return {
      columns,
      totalTasks,
      limit: input.limit || 50
    }
  }
})

export const getTasksStatsTool = tool({
  description:
    "Get comprehensive statistics and analytics about user's tasks. ALWAYS use this tool when user asks for statistics, how many tasks they have, task counts, priority distribution, analytics, or overview of their tasks. This tool provides total count, status breakdown, priority breakdown, overdue count, and completion rates.",
  inputSchema: getTasksStatsToolSchema,
  execute: async (input: GetTasksStatsToolInput) => {
    const convertedFilters = convertFilters(input.filters as InputTaskFilters)

    const [allTasks, pendingTasks, inProgressTasks, completedTasks, cancelledTasks, onHoldTasks] =
      await Promise.all([
        getTasks({ limit: 1, offset: 0, filters: convertedFilters }),
        getTasks({ limit: 1, offset: 0, filters: { ...convertedFilters, status: "pending" } }),
        getTasks({ limit: 1, offset: 0, filters: { ...convertedFilters, status: "inProgress" } }),
        getTasks({ limit: 1, offset: 0, filters: { ...convertedFilters, status: "completed" } }),
        getTasks({ limit: 1, offset: 0, filters: { ...convertedFilters, status: "cancelled" } }),
        getTasks({ limit: 1, offset: 0, filters: { ...convertedFilters, status: "onHold" } })
      ])

    const [nonePriority, lowPriority, mediumPriority, highPriority, urgentPriority] =
      await Promise.all([
        getTasks({ limit: 1, offset: 0, filters: { ...convertedFilters, priority: "none" } }),
        getTasks({ limit: 1, offset: 0, filters: { ...convertedFilters, priority: "low" } }),
        getTasks({ limit: 1, offset: 0, filters: { ...convertedFilters, priority: "medium" } }),
        getTasks({ limit: 1, offset: 0, filters: { ...convertedFilters, priority: "high" } }),
        getTasks({ limit: 1, offset: 0, filters: { ...convertedFilters, priority: "urgent" } })
      ])

    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const [overdueTasks, dueSoonTasks] = await Promise.all([
      getTasks({
        limit: 1,
        offset: 0,
        filters: {
          ...convertedFilters,
          dueDate: { to: now },
          status: ["pending", "inProgress", "onHold"]
        }
      }),
      getTasks({
        limit: 1,
        offset: 0,
        filters: {
          ...convertedFilters,
          dueDate: { from: now, to: sevenDaysFromNow },
          status: ["pending", "inProgress", "onHold"]
        }
      })
    ])

    const total = allTasks.total
    const completed = completedTasks.total
    const completionRate = total > 0 ? (completed / total) * 100 : 0

    return {
      total,
      byStatus: {
        pending: pendingTasks.total,
        inProgress: inProgressTasks.total,
        completed: completedTasks.total,
        cancelled: cancelledTasks.total,
        onHold: onHoldTasks.total
      },
      byPriority: {
        none: nonePriority.total,
        low: lowPriority.total,
        medium: mediumPriority.total,
        high: highPriority.total,
        urgent: urgentPriority.total
      },
      overdue: overdueTasks.total,
      dueSoon: dueSoonTasks.total,
      completionRate: Math.round(completionRate * 100) / 100,
      filters: input.filters
    } as TaskStats
  }
})

export const getTasksCountByStatusTool = tool({
  description:
    "Get count of tasks by status. Use when user asks for 'status counts', 'how many pending tasks', or 'status breakdown'. Generates a count breakdown of tasks by status with optional filtering.",
  inputSchema: getTasksCountByStatusToolSchema,
  execute: async (input: GetTasksCountByStatusToolInput) => {
    const convertedFilters = convertFilters(input.filters as InputTaskFilters)
    const statuses = ["pending", "inProgress", "completed", "cancelled", "onHold"]
    const counts = await Promise.all(
      statuses.map(async (status) => {
        const result = await getTasks({
          limit: 1,
          offset: 0,
          filters: {
            ...convertedFilters,
            status: status as TaskStatus
          }
        })
        return { status, count: result.total }
      })
    )

    return {
      counts,
      total: counts.reduce((sum, item) => sum + item.count, 0),
      filters: input.filters
    }
  }
})

export const getTasksCountByPriorityTool = tool({
  description:
    "Get count of tasks by priority level. Use when user asks for 'priority counts', 'how many high priority tasks', or 'priority breakdown'. Generates a count breakdown of tasks by priority level with optional filtering.",
  inputSchema: getTasksCountByPriorityToolSchema,
  execute: async (input: GetTasksCountByPriorityToolInput) => {
    const convertedFilters = convertFilters(input.filters as InputTaskFilters)
    const priorities = ["none", "low", "medium", "high", "urgent"]
    const counts = await Promise.all(
      priorities.map(async (priority) => {
        const result = await getTasks({
          limit: 1,
          offset: 0,
          filters: {
            ...convertedFilters,
            priority: priority as TaskPriority
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

export const getTasksCountByDateTool = tool({
  description:
    "Get count of tasks by date range. Use when user asks for 'tasks count by date', 'how many tasks this month', or 'date-based counts'. Counts tasks created within a specific date range.",
  inputSchema: getTasksCountByDateToolSchema,
  execute: async (input: GetTasksCountByDateToolInput) => {
    const filters: TaskFilters = {}
    if (input.startDate) {
      filters.dueDate = { ...filters.dueDate, from: new Date(input.startDate) }
    }
    if (input.endDate) {
      filters.dueDate = { ...filters.dueDate, to: new Date(input.endDate) }
    }

    const result = await getTasks({ limit: 1, offset: 0, filters: filters })
    return {
      total: result.total,
      startDate: input.startDate,
      endDate: input.endDate
    }
  }
})

export const getTasksCompletionRateTool = tool({
  description:
    "Get task completion rate. Use when user asks for 'completion rate', 'how many tasks completed', or 'productivity metrics'. Calculates the percentage of completed tasks with optional filtering.",
  inputSchema: getTasksCompletionRateToolSchema,
  execute: async (input: GetTasksCompletionRateToolInput) => {
    const convertedFilters = convertFilters(input.filters as InputTaskFilters)
    const [allTasks, completedTasks] = await Promise.all([
      getTasks({ limit: 1, offset: 0, filters: convertedFilters }),
      getTasks({ limit: 1, offset: 0, filters: { ...convertedFilters, status: "completed" } })
    ])

    const total = allTasks.total
    const completed = completedTasks.total
    const completionRate = total > 0 ? (completed / total) * 100 : 0

    return {
      total,
      completed,
      completionRate: Math.round(completionRate * 100) / 100,
      filters: input.filters
    }
  }
})

export const getTasksProductivityStatsTool = tool({
  description:
    "Get productivity statistics for tasks. Use when user asks for 'productivity stats', 'task performance', or 'work metrics'. Provides comprehensive productivity metrics including completion rates, task creation patterns, and performance indicators.",
  inputSchema: getTasksProductivityStatsToolSchema,
  execute: async (input: GetTasksProductivityStatsToolInput) => {
    const period = input.period || "week"
    const now = new Date()
    const startDate = new Date()

    switch (period) {
      case "day":
        startDate.setDate(now.getDate() - 1)
        break
      case "week":
        startDate.setDate(now.getDate() - 7)
        break
      case "month":
        startDate.setMonth(now.getMonth() - 1)
        break
      case "year":
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    const convertedFilters = convertFilters(input.filters as InputTaskFilters)
    const [allTasks, completedTasks, overdueTasks] = await Promise.all([
      getTasks({
        limit: 1,
        offset: 0,
        filters: {
          ...convertedFilters,
          dueDate: { from: startDate }
        }
      }),
      getTasks({
        limit: 1,
        offset: 0,
        filters: {
          ...convertedFilters,
          status: "completed",
          dueDate: { from: startDate }
        }
      }),
      getTasks({
        limit: 1,
        offset: 0,
        filters: {
          ...convertedFilters,
          dueDate: { to: now },
          status: ["pending", "inProgress", "onHold"]
        }
      })
    ])

    const tasksCreated = allTasks.total
    const tasksCompleted = completedTasks.total
    const tasksOverdue = overdueTasks.total
    const completionRate = tasksCreated > 0 ? (tasksCompleted / tasksCreated) * 100 : 0

    return {
      period,
      tasksCreated,
      tasksCompleted,
      tasksOverdue,
      completionRate: Math.round(completionRate * 100) / 100,
      averageCompletionTime: undefined,
      mostProductiveDay: undefined,
      leastProductiveDay: undefined,
      filters: input.filters
    }
  }
})

export const taskTools = {
  createTask: createTaskTool,
  updateTask: updateTaskTool,
  deleteTask: deleteTaskTool,
  listTasks: listTasksTool,
  getTaskById: getTaskByIdTool,
  searchTasks: searchTasksTool,
  getTasksByStatus: getTasksByStatusTool,
  getTasksByPriority: getTasksByPriorityTool,
  getCompletedTasks: getCompletedTasksTool,
  getPendingTasks: getPendingTasksTool,
  getInProgressTasks: getInProgressTasksTool,
  getTasksByDateRange: getTasksByDateRangeTool,
  getOverdueTasks: getOverdueTasksTool,
  getDueSoonTasks: getDueSoonTasksTool,
  getMainTasksOnly: getMainTasksOnlyTool,
  getSubtasksOnly: getSubtasksOnlyTool,
  getTasksByParentId: getTasksByParentIdTool,
  getTaskHierarchy: getTaskHierarchyTool,
  validateTaskHierarchy: validateTaskHierarchyTool,
  promoteSubtaskToMain: promoteSubtaskToMainTool,
  reorderTask: reorderTaskTool,
  moveTaskToStatus: moveTaskToStatusTool,
  getTasksForKanban: getTasksForKanbanTool,
  getTasksStats: getTasksStatsTool,
  getTasksCountByStatus: getTasksCountByStatusTool,
  getTasksCountByPriority: getTasksCountByPriorityTool,
  getTasksCountByDate: getTasksCountByDateTool,
  getTasksCompletionRate: getTasksCompletionRateTool,
  getTasksProductivityStats: getTasksProductivityStatsTool
} as const

export type TaskToolName = keyof typeof taskTools
