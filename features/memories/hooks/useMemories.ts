import { useListMemories } from "@/features/memories/api/queries"

import type { ListMemoriesRequest } from "@/features/memories/api/types"

export function useMemories(params: ListMemoriesRequest = {}) {
  return useListMemories(params)
}
