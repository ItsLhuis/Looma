import axios from "axios"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { memoriesKeys } from "./queries"
import { dashboardKeys } from "@/features/dashboard/api/queries"

import type {
  CreateMemoryRequest,
  CreateMemoryResponse,
  DeleteMemoryResponse,
  UpdateMemoryRequest,
  UpdateMemoryResponse
} from "./types"

const base = "/api/memories"

export function useCreateMemory() {
  const queryClient = useQueryClient()
  return useMutation<CreateMemoryResponse, Error, CreateMemoryRequest>({
    mutationFn: async (input) => {
      const res = await axios.post<CreateMemoryResponse>(base, input, { withCredentials: true })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memoriesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    }
  })
}

export function useUpdateMemory(id: string) {
  const queryClient = useQueryClient()
  return useMutation<UpdateMemoryResponse, Error, UpdateMemoryRequest>({
    mutationFn: async (input) => {
      const res = await axios.put<UpdateMemoryResponse>(`${base}/${id}`, input, {
        withCredentials: true
      })
      return res.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: memoriesKeys.details() })
      queryClient.invalidateQueries({ queryKey: memoriesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
      queryClient.setQueryData(memoriesKeys.detail(id), data)
    }
  })
}

export function useDeleteMemory(id: string) {
  const queryClient = useQueryClient()
  return useMutation<DeleteMemoryResponse, Error, void>({
    mutationFn: async () => {
      const res = await axios.delete<DeleteMemoryResponse>(`${base}/${id}`, {
        withCredentials: true
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memoriesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: memoriesKeys.details() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    }
  })
}
