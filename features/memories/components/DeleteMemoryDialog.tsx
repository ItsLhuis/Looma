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
  onDeleted?: () => void
}

function DeleteMemoryDialog({ memoryId, trigger, onDeleted }: DeleteMemoryDialogProps) {
  const [open, setOpen] = useState(false)

  const deleteMutation = useDeleteMemory(memoryId)

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
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            isLoading={deleteMutation.isPending}
            onClick={async () => {
              await deleteMutation.mutateAsync()
              setOpen(false)
              onDeleted?.()
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { DeleteMemoryDialog }
