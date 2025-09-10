"use client"

import { useEffect } from "react"

import { useRouter } from "next/navigation"

import { useForm } from "react-hook-form"

import {
  createInsertNoteSchema,
  createUpdateNoteSchema,
  type InsertNoteType,
  type UpdateNoteType
} from "@/features/notes/schemas"

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

import { useCreateNote, useGetNote, useUpdateNote } from "@/features/notes/api"

import type { NotePriority } from "@/features/notes/types"

export type NoteEditorProps = {
  noteId?: string
  mode?: "insert" | "update"
}

const priorityOptions: ReadonlyArray<{ value: NotePriority; label: string }> = [
  { value: "none", label: "None" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" }
]

function NoteEditor({ noteId, mode = "insert" }: NoteEditorProps) {
  const router = useRouter()

  const createMutation = useCreateNote()
  const updateMutation = useUpdateNote(noteId ?? "")

  const fullNoteQuery = useGetNote(noteId ?? "", mode === "update" && !!noteId)

  const currentMutation = mode === "insert" ? createMutation : updateMutation

  const formSchema = mode === "insert" ? createInsertNoteSchema() : createUpdateNoteSchema()

  const note = fullNoteQuery?.data?.data

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      title: note?.title ?? "",
      content: note?.content ?? "",
      summary: note?.summary ?? "",
      isFavorite: note?.isFavorite ?? false,
      isArchived: note?.isArchived ?? false,
      priority: note?.priority ?? "none"
    }
  })

  useEffect(() => {
    if (mode === "update" && note) {
      form.reset({
        title: note.title || "",
        content: note.content || "",
        summary: note.summary || "",
        priority: note.priority || "none",
        isFavorite: note.isFavorite || false,
        isArchived: note.isArchived || false
      })
    }
  }, [note, form, mode])

  useEffect(() => {
    if (currentMutation.isSuccess) {
      router.push("/notes")
    }
  }, [currentMutation.isSuccess, router])

  const handleFormSubmit = async (values: InsertNoteType | UpdateNoteType) => {
    if (mode === "insert") {
      await createMutation.mutateAsync(values as InsertNoteType)
      return
    }

    await updateMutation.mutateAsync(values as UpdateNoteType)
  }

  if (mode === "update" && fullNoteQuery?.isLoading) {
    return (
      <div className="flex h-full flex-1 flex-col space-y-4">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-3 w-28" />
        <Skeleton className="min-h-[400px] w-full" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="flex items-center justify-end gap-2">
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    )
  }

  if (mode === "update" && fullNoteQuery?.isError) {
    return <div className="text-destructive text-sm">Failed to load note.</div>
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
                  <Input placeholder="Note title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Summary</FormLabel>
                <FormControl>
                  <Input placeholder="Brief summary" {...field} value={field.value ?? ""} />
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
                  placeholder="Write your note"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => {
                return (
                  <FormItem key={field.value}>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? "none"}>
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
                )
              }}
            />
            <FormField
              control={form.control}
              name="isFavorite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Favorite</FormLabel>
                  <FormControl>
                    <Label
                      className="dark:bg-input/30 border-input flex items-center rounded-md border p-2"
                      htmlFor="favorite"
                    >
                      <Switch
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                        id="favorite"
                      />
                      <Typography affects={["muted", "small"]}>Mark as favorite</Typography>
                    </Label>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isArchived"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Archive</FormLabel>
                  <FormControl>
                    <Label
                      className="dark:bg-input/30 border-input flex items-center rounded-md border p-2"
                      htmlFor="archive"
                    >
                      <Switch
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                        id="archive"
                      />
                      <Typography affects={["muted", "small"]}>Archive note</Typography>
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
              onClick={() => router.push("/notes")}
              disabled={currentMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={currentMutation.isPending}>
              {mode === "insert" ? "Create" : "Save"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}

export { NoteEditor }
