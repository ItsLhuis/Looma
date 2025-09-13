import axios from "axios"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { eventsKeys } from "./queries"

import type {
  CreateEventRequest,
  CreateEventResponse,
  DeleteEventResponse,
  UpdateEventRequest,
  UpdateEventResponse
} from "./types"

const base = "/api/events"

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation<CreateEventResponse, Error, CreateEventRequest>({
    mutationFn: async (input) => {
      const res = await axios.post<CreateEventResponse>(base, input, { withCredentials: true })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsKeys.lists() })
    }
  })
}

export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient()
  return useMutation<UpdateEventResponse, Error, UpdateEventRequest>({
    mutationFn: async (input) => {
      const res = await axios.put<UpdateEventResponse>(`${base}/${id}`, input, {
        withCredentials: true
      })
      return res.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: eventsKeys.details() })
      queryClient.invalidateQueries({ queryKey: eventsKeys.lists() })
      queryClient.setQueryData(eventsKeys.detail(id), data)
    }
  })
}

export function useDeleteEvent(id: string) {
  const queryClient = useQueryClient()
  return useMutation<DeleteEventResponse, Error, void>({
    mutationFn: async () => {
      const res = await axios.delete<DeleteEventResponse>(`${base}/${id}`, {
        withCredentials: true
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: eventsKeys.details() })
    }
  })
}
