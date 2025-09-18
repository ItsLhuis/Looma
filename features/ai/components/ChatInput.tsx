"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

import { useDropzone } from "react-dropzone"

import Image from "next/image"

import { Button, Icon } from "@/components/ui"

type FileWithPreview = {
  id: string
  file: File
  preview?: string
  type: string
}

type ChatInputProps = {
  onSendMessage: (text: string, files?: File[]) => void
  onStop: () => void
  status: "ready" | "submitted" | "streaming" | "error"
  disabled?: boolean
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

const getFileTypeLabel = (type: string): string => {
  const parts = type.split("/")
  let label = parts[parts.length - 1].toUpperCase()
  if (label.length > 7 && label.includes("-")) {
    label = label.substring(0, label.indexOf("-"))
  }
  if (label.length > 10) {
    label = label.substring(0, 10) + "..."
  }
  return label
}

const FilePreviewCard = ({
  file,
  onRemove
}: {
  file: FileWithPreview
  onRemove: (id: string) => void
}) => {
  const isImage = file.type.startsWith("image/")

  return (
    <div className="group bg-muted border-border relative h-[125px] w-[125px] flex-shrink-0 overflow-hidden rounded-lg border p-3">
      <div className="flex h-full w-full items-start gap-3 overflow-hidden">
        {isImage && file.preview ? (
          <div className="bg-muted relative h-full w-full overflow-hidden rounded-md">
            <Image
              src={file.preview}
              alt={file.file.name}
              fill
              className="object-cover"
              sizes="125px"
              unoptimized={file.preview.startsWith("blob:")}
            />
          </div>
        ) : (
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="group to-background/80 absolute inset-0 flex items-end justify-start overflow-hidden bg-gradient-to-b from-transparent p-2">
              <p className="text-foreground bg-muted border-border absolute bottom-2 left-2 rounded-md border px-2 py-1 text-xs capitalize">
                {getFileTypeLabel(file.type)}
              </p>
            </div>
            <p
              className="text-foreground max-w-[90%] truncate text-xs font-medium"
              title={file.file.name}
            >
              {file.file.name}
            </p>
            <p className="text-muted-foreground mt-1 text-[10px]">
              {formatFileSize(file.file.size)}
            </p>
          </div>
        )}
      </div>
      <Button
        size="icon"
        variant="outline"
        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
        onClick={() => onRemove(file.id)}
      >
        <Icon name="X" />
      </Button>
    </div>
  )
}

function ChatInput({ onSendMessage, onStop, status, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const imageFiles = acceptedFiles.filter((file) => file.type.startsWith("image/"))

    const newFiles = imageFiles.map((file) => ({
      id: Math.random().toString(),
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      type: file.type || "application/octet-stream"
    }))

    setSelectedFiles((prev) => {
      const currentCount = prev.length
      const remainingSlots = 5 - currentCount
      const filesToAdd = newFiles.slice(0, remainingSlots)
      return [...prev, ...filesToAdd]
    })
    setIsDragging(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"]
    },
    multiple: true,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    noClick: true,
    noKeyboard: true
  })

  const removeFile = (id: string) => {
    setSelectedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id)
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return prev.filter((f) => f.id !== id)
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if ((input.trim() || selectedFiles.length > 0) && status === "ready") {
      onSendMessage(
        input,
        selectedFiles.map((f) => f.file)
      )
      setInput("")
      selectedFiles.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview)
      })
      setSelectedFiles([])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && status === "ready") {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      const maxHeight = 120
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        maxHeight
      )}px`
    }
  }, [input])

  useEffect(() => {
    if (status === "ready" && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [status])

  const isProcessing = status === "submitted" || status === "streaming"
  const canSend = status === "ready" && (input.trim().length > 0 || selectedFiles.length > 0)
  const canAddFiles = selectedFiles.length < 5

  return (
    <div className="bg-background border-t p-6">
      <div {...getRootProps()} className="relative w-full">
        {(isDragging || isDragActive) && (
          <div className="bg-primary/10 border-primary pointer-events-none absolute inset-0 z-50 flex flex-col items-center justify-center rounded-xl border-2 border-dashed">
            <p className="text-primary flex items-center gap-2 text-sm">
              <Icon name="UploadCloud" className="size-4 opacity-50" />
              Drop images here to add to chat
            </p>
          </div>
        )}
        <div className="bg-card border-border flex min-h-[150px] flex-col rounded-xl border">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message or drag images here"
            disabled={disabled}
            className="text-foreground placeholder:text-muted-foreground max-h-[120px] min-h-[100px] w-full flex-1 resize-none border-0 border-none bg-transparent p-4 text-sm shadow-none outline-none focus:border-none focus:ring-0 focus:outline-none focus-visible:ring-0 sm:text-base"
            rows={1}
          />
          <div className="flex w-full items-center justify-between gap-2 px-3 pb-1.5">
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="text-muted-foreground hover:text-foreground hover:bg-muted h-9 w-9 flex-shrink-0 p-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || !canAddFiles || isProcessing}
                title={canAddFiles ? "Attach images" : "Maximum 5 images allowed"}
              >
                <Icon name="Image" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {isProcessing ? (
                <Button type="button" variant="outline" size="icon" onClick={onStop}>
                  <Icon name="Square" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  className={cn(
                    "h-9 w-9 flex-shrink-0 rounded-md transition-colors",
                    canSend
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                  onClick={handleSubmit}
                  disabled={!canSend}
                  title="Send message"
                >
                  {isProcessing ? (
                    <Icon name="Loader2" className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon name="ArrowUp" />
                  )}
                </Button>
              )}
            </div>
          </div>
          {selectedFiles.length > 0 && (
            <div className="border-border bg-muted/30 w-full border-t p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-muted-foreground text-xs">
                  {selectedFiles.length}/5 images
                </span>
              </div>
              <div className="flex h-[125px] w-full gap-3 overflow-x-auto">
                {selectedFiles.map((file) => (
                  <FilePreviewCard key={file.id} file={file} onRemove={removeFile} />
                ))}
              </div>
            </div>
          )}
        </div>
        <input {...getInputProps()} />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files) {
              onDrop(Array.from(e.target.files))
              e.target.value = ""
            }
          }}
        />
      </div>
    </div>
  )
}

export { ChatInput }
