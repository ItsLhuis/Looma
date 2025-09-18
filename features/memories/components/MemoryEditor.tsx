"use client"

import { useEffect } from "react"

import { useRouter } from "next/navigation"

import { useForm } from "react-hook-form"

import {
  createInsertMemorySchema,
  createUpdateMemorySchema,
  type InsertMemoryType,
  type UpdateMemoryType
} from "@/features/memories/schemas"

import { zodResolver } from "@hookform/resolvers/zod"

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Switch,
  Textarea,
  Typography
} from "@/components/ui"

import { useCreateMemory, useGetMemory, useUpdateMemory } from "@/features/memories/api"

import type { MemoryImportance } from "@/features/memories/types"

export type MemoryEditorProps = {
  memoryId?: string
  mode?: "insert" | "update"
}

const importanceOptions: ReadonlyArray<{ value: MemoryImportance; label: string }> = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" }
]

function MemoryEditor({ memoryId, mode = "insert" }: MemoryEditorProps) {
  const router = useRouter()

  const createMutation = useCreateMemory()
  const updateMutation = useUpdateMemory(memoryId ?? "")

  const fullMemoryQuery = useGetMemory(memoryId ?? "", mode === "update" && !!memoryId)

  const currentMutation = mode === "insert" ? createMutation : updateMutation

  const formSchema = mode === "insert" ? createInsertMemorySchema() : createUpdateMemorySchema()

  const memory = fullMemoryQuery?.data?.data

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      content: "",
      importance: "medium" as MemoryImportance,
      isActive: true
    }
  })

  useEffect(() => {
    if (mode === "update" && memory) {
      form.reset({
        title: memory.title || "",
        content: memory.content || "",
        importance: memory.importance || "medium",
        isActive: memory.isActive ?? true
      })
    }
  }, [memory, mode])

  useEffect(() => {
    if (currentMutation.isSuccess) {
      router.push("/memories")
    }
  }, [currentMutation.isSuccess, router])

  const handleFormSubmit = async (values: InsertMemoryType | UpdateMemoryType) => {
    if (mode === "insert") {
      await createMutation.mutateAsync(values as InsertMemoryType)
      return
    }

    await updateMutation.mutateAsync(values as UpdateMemoryType)
  }

  if (mode === "update" && fullMemoryQuery?.isLoading) {
    return (
      <div className="flex h-full flex-1 flex-col space-y-4">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-3 w-28" />
        <Skeleton className="min-h-[400px] w-full" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex h-full flex-1 flex-col space-y-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="flex h-full flex-1 flex-col space-y-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    )
  }

  if (mode === "update" && fullMemoryQuery?.isError) {
    return <div className="text-destructive text-sm">Failed to load memory</div>
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="flex h-full flex-col space-y-6"
      >
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Memory title"
                    {...field}
                    disabled={currentMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="flex flex-1 flex-col">
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea
                  className="min-h-[400px]"
                  placeholder="Write your memory"
                  {...field}
                  value={field.value ?? ""}
                  disabled={currentMutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="importance"
              render={({ field }) => {
                return (
                  <FormItem key={field.value}>
                    <FormLabel>Importance</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? "medium"}
                      disabled={currentMutation.isPending}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select importance" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {importanceOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Active</FormLabel>
                  <FormControl>
                    <Label
                      className="dark:bg-input/30 border-input flex items-center rounded-md border p-2"
                      htmlFor="active"
                    >
                      <Switch
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                        id="active"
                        disabled={currentMutation.isPending}
                      />
                      <Typography affects={["muted", "small"]}>Mark as active</Typography>
                    </Label>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/memories")}
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
        </div>
      </form>
    </Form>
  )
}

export { MemoryEditor }
