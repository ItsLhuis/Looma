import type { InsertTaskType, UpdateTaskType } from "@/features/tasks/schemas"
import type { Task, QueryTasksParams } from "@/features/tasks/types"

export type ListTasksRequest = QueryTasksParams
export type ListTasksResponse = { data: Task[]; total: number }

export type GetTaskResponse = { data: Task }

export type CreateTaskRequest = InsertTaskType
export type CreateTaskResponse = { data: Task }

export type UpdateTaskRequest = UpdateTaskType
export type UpdateTaskResponse = { data: Task }

export type DeleteTaskResponse = { data: Task }

export type UpdateTaskStatusRequest = {
  status: Task["status"]
  completedAt?: Date
}

export type UpdateTaskStatusResponse = { data: Task }

export type ReorderTasksRequest = {
  taskId: string
  newPosition: number
  newStatus?: Task["status"]
}

export type ReorderTasksResponse = { data: Task }
