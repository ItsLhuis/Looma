import type { MemoryImportance } from "@/features/memories/types"

export type ActionStatus = "success" | "pending" | "cancelled"

export const getImportanceClasses = (importance: MemoryImportance): string => {
  switch (importance) {
    case "critical":
      return "bg-error text-error-foreground border border-error"
    case "high":
      return "bg-warning text-warning-foreground border border-warning"
    case "medium":
      return "bg-info text-info-foreground border border-info"
    case "low":
      return "bg-success text-success-foreground border border-success"
    default:
      return "bg-muted text-muted-foreground border border-muted"
  }
}

export const getImportanceIcon = (
  importance: MemoryImportance
): "AlertTriangle" | "AlertCircle" | "Info" | "CheckCircle" => {
  switch (importance) {
    case "critical":
      return "AlertTriangle"
    case "high":
      return "AlertCircle"
    case "medium":
      return "Info"
    case "low":
      return "CheckCircle"
    default:
      return "Info"
  }
}

export const getImportanceLabel = (importance: MemoryImportance): string => {
  switch (importance) {
    case "critical":
      return "Critical"
    case "high":
      return "High"
    case "medium":
      return "Medium"
    case "low":
      return "Low"
    default:
      return importance
  }
}

export const getActionStatusClasses = (actionType: ActionStatus): string => {
  switch (actionType) {
    case "success":
      return "border-success/20 bg-success/5"
    case "pending":
      return "border-muted/20 bg-muted/5"
    case "cancelled":
      return "border-error/20 bg-error/5"
    default:
      return "border-muted/20 bg-muted/5"
  }
}

export const getActionStatusIcon = (actionType: ActionStatus): "Check" | "Clock" | "X" => {
  switch (actionType) {
    case "success":
      return "Check"
    case "pending":
      return "Clock"
    case "cancelled":
      return "X"
    default:
      return "Clock"
  }
}

export const getActionStatusColor = (actionType: ActionStatus): string => {
  switch (actionType) {
    case "success":
      return "text-success"
    case "pending":
      return "text-muted-foreground"
    case "cancelled":
      return "text-error"
    default:
      return "text-muted-foreground"
  }
}
