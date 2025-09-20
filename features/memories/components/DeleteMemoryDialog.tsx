"use client"

import { useState } from "react"

import { useDeleteMemory } from "@/features/memories/api"

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui"

type DeleteMemoryDialogProps = {
  memoryId: string
  trigger: React.ReactNode
}

function DeleteMemoryDialog({ memoryId, trigger }: DeleteMemoryDialogProps) {
  const [open, setOpen] = useState(false)

  const deleteMutation = useDeleteMemory(memoryId)

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync()
      setOpen(false)
    } catch (error) {
      console.error("Failed to delete memory:", error)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (deleteMutation.isPending) return
        setOpen(value)
      }}
    >
      <div onClick={() => setOpen(true)}>{trigger}</div>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Memory</DialogTitle>
          <DialogDescription>This action cannot be undone</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            isLoading={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button variant="destructive" isLoading={deleteMutation.isPending} onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { DeleteMemoryDialog }
