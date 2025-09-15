import axios from "axios"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { tasksKeys } from "./queries"
import { dashboardKeys } from "@/features/dashboard/api/queries"

import type {
  CreateTaskRequest,
  CreateTaskResponse,
  DeleteTaskResponse,
  ReorderTasksRequest,
  ReorderTasksResponse,
  UpdateTaskRequest,
  UpdateTaskResponse,
  UpdateTaskStatusRequest,
  UpdateTaskStatusResponse
} from "./types"

const base = "/api/tasks"

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation<CreateTaskResponse, Error, CreateTaskRequest>({
    mutationFn: async (input) => {
      const res = await axios.post<CreateTaskResponse>(base, input, { withCredentials: true })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    }
  })
}

export function useUpdateTask(id: string) {
  const queryClient = useQueryClient()
  return useMutation<UpdateTaskResponse, Error, UpdateTaskRequest>({
    mutationFn: async (input) => {
      const res = await axios.put<UpdateTaskResponse>(`${base}/${id}`, input, {
        withCredentials: true
      })
      return res.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.details() })
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
      queryClient.setQueryData(tasksKeys.detail(id), data)
    }
  })
}

export function useUpdateTaskStatus(id: string) {
  const queryClient = useQueryClient()
  return useMutation<UpdateTaskStatusResponse, Error, UpdateTaskStatusRequest>({
    mutationFn: async (input) => {
      const res = await axios.patch<UpdateTaskStatusResponse>(`${base}/${id}/status`, input, {
        withCredentials: true
      })
      return res.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.details() })
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
      queryClient.setQueryData(tasksKeys.detail(id), data)
    }
  })
}

export function useReorderTask() {
  const queryClient = useQueryClient()
  return useMutation<ReorderTasksResponse, Error, ReorderTasksRequest>({
    mutationFn: async (input) => {
      const res = await axios.patch<ReorderTasksResponse>(
        `${base}/${input.taskId}/reorder`,
        input,
        {
          withCredentials: true
        }
      )
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    }
  })
}

export function useDeleteTask(id: string) {
  const queryClient = useQueryClient()
  return useMutation<DeleteTaskResponse, Error, void>({
    mutationFn: async () => {
      const res = await axios.delete<DeleteTaskResponse>(`${base}/${id}`, { withCredentials: true })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.lists() })
      queryClient.invalidateQueries({ queryKey: tasksKeys.details() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    }
  })
}
