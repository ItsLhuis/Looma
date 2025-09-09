import axios from "axios"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { notesKeys } from "./queries"

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.lists() })
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
      queryClient.setQueryData(notesKeys.detail(id), data)
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: notesKeys.details() })
    }
  })
}
