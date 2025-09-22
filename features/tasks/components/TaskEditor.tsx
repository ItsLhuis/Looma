"use client"

import { useEffect } from "react"

import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"

import { formatDateForDisplay } from "@/lib/date"

import {
  createInsertTaskSchema,
  createUpdateTaskSchema,
  type InsertTaskType,
  type UpdateTaskType
} from "@/features/tasks/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import {
  Button,
  Calendar,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Icon,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Textarea
} from "@/components/ui"

import { useCreateTask, useGetTask, useListTasks, useUpdateTask } from "@/features/tasks/api"

import type { TaskPriority, TaskStatus } from "@/features/tasks/types"

function formatDate(date: Date) {
  return formatDateForDisplay(date)
}

export type TaskEditorProps = {
  taskId?: string
  mode?: "insert" | "update"
}

const priorityOptions: ReadonlyArray<{ value: TaskPriority; label: string }> = [
  { value: "none", label: "None" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" }
]

const statusOptions: ReadonlyArray<{ value: TaskStatus; label: string }> = [
  { value: "pending", label: "Pending" },
  { value: "inProgress", label: "In Progress" },
  { value: "onHold", label: "On Hold" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" }
]

function TaskEditor({ taskId, mode = "insert" }: TaskEditorProps) {
  const router = useRouter()

  const createMutation = useCreateTask()
  const updateMutation = useUpdateTask(taskId ?? "")

  const fullTaskQuery = useGetTask(taskId ?? "", mode === "update" && !!taskId)
  const parentTasksQuery = useListTasks({
    limit: 1000,
    offset: 0,
    filters: { parentTaskId: null }
  })

  const currentMutation = mode === "insert" ? createMutation : updateMutation

  const formSchema = mode === "insert" ? createInsertTaskSchema() : createUpdateTaskSchema()

  const task = fullTaskQuery?.data?.data
  const parentTasks = parentTasksQuery?.data?.data ?? []

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      status: "pending" as TaskStatus,
      priority: "none" as TaskPriority,
      dueDate: undefined,
      estimatedDuration: undefined,
      parentTaskId: undefined
    }
  })

  useEffect(() => {
    if (mode === "update" && task) {
      form.reset({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "pending",
        priority: task.priority || "none",
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        estimatedDuration: task.estimatedDuration ?? undefined,
        parentTaskId: task.parentTaskId ?? undefined
      })
    }
  }, [task, form, mode])

  useEffect(() => {
    if (currentMutation.isSuccess) {
      router.push("/tasks")
    }
  }, [currentMutation.isSuccess, router])

  const onSubmit = (data: InsertTaskType | UpdateTaskType) => {
    const submitData = {
      ...data,
      dueDate: data.dueDate ? data.dueDate.toISOString() : undefined,
      parentTaskId: data.parentTaskId === "none" ? undefined : data.parentTaskId
    }

    if (mode === "insert") {
      createMutation.mutate(submitData as InsertTaskType)
    } else {
      updateMutation.mutate(submitData as UpdateTaskType)
    }
  }

  if (mode === "update" && fullTaskQuery.isLoading) {
    return (
      <div className="flex h-full flex-1 flex-col space-y-4">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-3 w-28" />
        <Skeleton className="min-h-[400px] w-full" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex h-full flex-1 flex-col space-y-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="flex h-full flex-1 flex-col space-y-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="flex h-full flex-1 flex-col space-y-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="flex h-full flex-1 flex-col space-y-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
        <div className="flex h-full flex-1 flex-col space-y-4">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="flex items-center justify-end gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    )
  }

  if (mode === "update" && fullTaskQuery?.isError) {
    return <div className="text-destructive text-sm">Failed to load task</div>
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Task title"
                      {...field}
                      disabled={currentMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your task description"
                      className="min-h-[400px]"
                      {...field}
                      value={field.value ?? ""}
                      disabled={currentMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem key={field.value}>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={currentMutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem key={field.value}>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={currentMutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {priorityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "hover:text-foreground w-full pl-3",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={currentMutation.isPending}
                        >
                          {field.value ? formatDate(field.value) : <span>Pick a date</span>}
                          <Icon name="Calendar" className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date("1900-01-01") || currentMutation.isPending
                        }
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="estimatedDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="60"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                      }
                      disabled={currentMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parentTaskId"
              render={({ field }) => (
                <FormItem className="md:col-span-2" key={field.value}>
                  <FormLabel>Parent Task (for subtasks)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                    disabled={currentMutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select parent task (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No parent task</SelectItem>
                      {parentTasks
                        .filter((t) => t.id !== taskId)
                        .map((parentTask) => (
                          <SelectItem key={parentTask.id} value={parentTask.id}>
                            {parentTask.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/tasks")}
              disabled={currentMutation.isPending}
              isLoading={currentMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!form.formState.isValid || currentMutation.isPending}
              isLoading={currentMutation.isPending}
            >
              {mode === "insert" ? "Create" : "Save"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export { TaskEditor }
