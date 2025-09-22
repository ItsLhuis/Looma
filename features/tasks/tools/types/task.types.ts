import type {
  ApprovalStatus,
  CreateTaskToolInput,
  DeleteTaskToolInput,
  UpdateTaskToolInput
} from "../schemas/task.schema"

export type TaskCreationToolCall = {
  toolCallId: string
  toolName: "createTask"
  input: CreateTaskToolInput
  state: "input-available" | "result-available"
  output?: ApprovalStatus | string
}

export type TaskUpdateToolCall = {
  toolCallId: string
  toolName: "updateTask"
  input: UpdateTaskToolInput
  state: "input-available" | "result-available"
  output?: ApprovalStatus | string
}

export type TaskDeleteToolCall = {
  toolCallId: string
  toolName: "deleteTask"
  input: DeleteTaskToolInput
  state: "input-available" | "result-available"
  output?: ApprovalStatus | string
}

export type TaskCreationConfirmationData = {
  toolCallId: string
  approved: boolean
  taskData: CreateTaskToolInput
}

export type TaskUpdateConfirmationData = {
  toolCallId: string
  approved: boolean
  taskData: UpdateTaskToolInput
}

export type TaskDeleteConfirmationData = {
  toolCallId: string
  approved: boolean
  taskData: DeleteTaskToolInput
}

export type TaskCreationResult = {
  success: boolean
  taskId?: string
  message: string
  taskData?: CreateTaskToolInput
}

export type TaskUpdateResult = {
  success: boolean
  taskId?: string
  message: string
  taskData?: UpdateTaskToolInput
}

export type TaskDeleteResult = {
  success: boolean
  taskId?: string
  message: string
  taskData?: DeleteTaskToolInput
}

export type TaskHierarchyValidation = {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export type TaskBreakdownSuggestion = {
  mainTask: {
    title: string
    description: string
    priority: "none" | "low" | "medium" | "high" | "urgent"
    estimatedDuration?: number
  }
  subtasks: Array<{
    title: string
    description: string
    priority: "none" | "low" | "medium" | "high" | "urgent"
    estimatedDuration?: number
  }>
}

export type TaskStats = {
  total: number
  byStatus: {
    pending: number
    inProgress: number
    completed: number
    cancelled: number
    onHold: number
  }
  byPriority: {
    none: number
    low: number
    medium: number
    high: number
    urgent: number
  }
  overdue: number
  dueSoon: number
  completionRate: number
  averageCompletionTime?: number
  filters?: {
    status?: string | string[]
    priority?: string | string[]
    dueDate?: { from?: Date; to?: Date }
    parentTaskId?: string | null
  }
}

export type TaskToolResult = {
  type:
    | "TASK_CREATED"
    | "TASK_UPDATED"
    | "TASK_DELETED"
    | "TASK_CREATION_CANCELLED"
    | "TASK_UPDATE_CANCELLED"
    | "TASK_DELETE_CANCELLED"
    | "ERROR"
  data?: {
    taskId?: string
    taskData?: CreateTaskToolInput | UpdateTaskToolInput | DeleteTaskToolInput
    message?: string
  }
  message: string
}

export type TaskListResult = {
  tasks: Array<{
    id: string
    title: string
    description: string | null
    status: "pending" | "inProgress" | "completed" | "cancelled" | "onHold"
    priority: "none" | "low" | "medium" | "high" | "urgent"
    dueDate: Date | null
    estimatedDuration: number | null
    position: number
    parentTaskId: string | null
    createdAt: Date
    updatedAt: Date
    completedAt: Date | null
  }>
  total: number
  limit: number
  offset: number
  hasMore: boolean
  filters?: {
    search?: string
    status?: string | string[]
    priority?: string | string[]
    dueDate?: { from?: Date; to?: Date }
    parentTaskId?: string | null
  }
}

export type TaskSearchResult = {
  tasks: Array<{
    id: string
    title: string
    description: string | null
    status: "pending" | "inProgress" | "completed" | "cancelled" | "onHold"
    priority: "none" | "low" | "medium" | "high" | "urgent"
    dueDate: Date | null
    estimatedDuration: number | null
    position: number
    parentTaskId: string | null
    createdAt: Date
    updatedAt: Date
    completedAt: Date | null
  }>
  query: string
  count: number
}

export type TaskHierarchyResult = {
  task: {
    id: string
    title: string
    description: string | null
    status: "pending" | "inProgress" | "completed" | "cancelled" | "onHold"
    priority: "none" | "low" | "medium" | "high" | "urgent"
    dueDate: Date | null
    estimatedDuration: number | null
    position: number
    parentTaskId: string | null
    createdAt: Date
    updatedAt: Date
    completedAt: Date | null
  }
  subtasks: Array<{
    id: string
    title: string
    description: string | null
    status: "pending" | "inProgress" | "completed" | "cancelled" | "onHold"
    priority: "none" | "low" | "medium" | "high" | "urgent"
    dueDate: Date | null
    estimatedDuration: number | null
    position: number
    parentTaskId: string | null
    createdAt: Date
    updatedAt: Date
    completedAt: Date | null
  }>
  hasSubtasks: boolean
  isSubtask: boolean
  parentTask?: {
    id: string
    title: string
    description: string | null
    status: "pending" | "inProgress" | "completed" | "cancelled" | "onHold"
    priority: "none" | "low" | "medium" | "high" | "urgent"
    dueDate: Date | null
    estimatedDuration: number | null
    position: number
    parentTaskId: string | null
    createdAt: Date
    updatedAt: Date
    completedAt: Date | null
  } | null
}
