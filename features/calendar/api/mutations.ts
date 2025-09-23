import axios from "axios"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { eventsKeys } from "./queries"
import { dashboardKeys } from "@/features/dashboard/api/queries"

import { toast } from "sonner"

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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: eventsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
      toast.success(`Event created successfully`, {
        description: `"${data.data.title}" has been successfully created!`
      })
    },
    onError: () => {
      toast.error("Event creation failed")
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
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
      queryClient.setQueryData(eventsKeys.detail(id), data)
      toast.success(`Event updated successfully`, {
        description: `"${data.data.title}" has been successfully updated!`
      })
    },
    onError: () => {
      toast.error("Event update failed")
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: eventsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: eventsKeys.details() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
      toast.success(`Event deleted successfully`, {
        description: `"${data.data.title}" has been successfully deleted!`
      })
    },
    onError: () => {
      toast.error("Event deletion failed")
    }
  })
}
