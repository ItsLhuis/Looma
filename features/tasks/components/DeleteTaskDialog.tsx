"use client"

import { useState } from "react"

import { useDeleteTask } from "@/features/tasks/api"

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui"

export type DeleteTaskDialogProps = {
  taskId: string
  trigger: React.ReactNode
}

function DeleteTaskDialog({ taskId, trigger }: DeleteTaskDialogProps) {
  const [open, setOpen] = useState(false)

  const deleteTask = useDeleteTask(taskId)

  const handleDelete = async () => {
    try {
      await deleteTask.mutateAsync()
      setOpen(false)
    } catch (error) {
      console.error("Failed to delete task:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Task</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this task? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} isLoading={deleteTask.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} isLoading={deleteTask.isPending}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { DeleteTaskDialog }
