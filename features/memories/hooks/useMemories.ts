import { useListMemories, useGetMemory } from "../api/queries"
import { useCreateMemory, useUpdateMemory, useDeleteMemory } from "../api/mutations"

import type { ListMemoriesRequest } from "../api/types"

export function useMemories(params: ListMemoriesRequest = {}) {
  return useListMemories(params)
}

export function useMemory(id: string, enabled = true) {
  return useGetMemory(id, enabled)
}

export function useCreateMemoryMutation() {
  return useCreateMemory()
}

export function useUpdateMemoryMutation(id: string) {
  return useUpdateMemory(id)
}

export function useDeleteMemoryMutation(id: string) {
  return useDeleteMemory(id)
}
