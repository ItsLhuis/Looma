export type ToolResult<T = unknown> = {
  type: string
  data: T
  success: boolean
  message?: string
}

export type ToolConfirmationProps<TInput = unknown> = {
  toolCallId: string
  input: TInput
  onApprove: (toolCallId: string, output: string) => void
  onReject: (toolCallId: string, output: string) => void
}

export type ToolResultProps<T = unknown> = {
  toolCallId: string
  data: T
  type: string
}
