import axios from "axios"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { dashboardKeys } from "@/features/dashboard/api/queries"
import { notesKeys } from "./queries"

import { toast } from "sonner"

import type {
  CreateNoteRequest,
  CreateNoteResponse,
  DeleteNoteResponse,
  UpdateNoteRequest,
  UpdateNoteResponse
} from "./types"

const base = "/api/notes"

export function useCreateNote() {
  const queryClient = useQueryClient()
  return useMutation<CreateNoteResponse, Error, CreateNoteRequest>({
    mutationFn: async (input) => {
      const res = await axios.post<CreateNoteResponse>(base, input, { withCredentials: true })
      return res.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: notesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
      toast.success(`Note created successfully`, {
        description: `"${data.data.title}" has been successfully created!`
      })
    },
    onError: () => {
      toast.error("Note creation failed")
    }
  })
}

export function useUpdateNote(id: string) {
  const queryClient = useQueryClient()
  return useMutation<UpdateNoteResponse, Error, UpdateNoteRequest>({
    mutationFn: async (input) => {
      const res = await axios.put<UpdateNoteResponse>(`${base}/${id}`, input, {
        withCredentials: true
      })
      return res.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: notesKeys.details() })
      queryClient.invalidateQueries({ queryKey: notesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
      queryClient.setQueryData(notesKeys.detail(id), data)
      toast.success(`Note updated successfully`, {
        description: `"${data.data.title}" has been successfully updated!`
      })
    },
    onError: () => {
      toast.error("Note update failed")
    }
  })
}

export function useDeleteNote(id: string) {
  const queryClient = useQueryClient()
  return useMutation<DeleteNoteResponse, Error, void>({
    mutationFn: async () => {
      const res = await axios.delete<DeleteNoteResponse>(`${base}/${id}`, { withCredentials: true })
      return res.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: notesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notesKeys.details() })
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
      toast.success(`Note deleted successfully`, {
        description: `"${data.data.title}" has been successfully deleted!`
      })
    },
    onError: () => {
      toast.error("Note deletion failed")
    }
  })
}
