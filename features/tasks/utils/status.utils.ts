import type { TaskPriority, TaskStatus } from "@/features/tasks/types"

export const getPriorityClasses = (priority: TaskPriority) => {
  switch (priority) {
    case "urgent":
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

export const getStatusClasses = (status: TaskStatus) => {
  switch (status) {
    case "completed":
      return "bg-success text-success-foreground border border-success"
    case "inProgress":
      return "bg-info text-info-foreground border border-info"
    case "onHold":
      return "bg-warning text-warning-foreground border border-warning"
    case "cancelled":
      return "bg-error text-error-foreground border border-error"
    default:
      return "bg-muted text-muted-foreground border border-muted"
  }
}

export const getStatusLabel = (status: TaskStatus) => {
  switch (status) {
    case "pending":
      return "Pending"
    case "inProgress":
      return "In Progress"
    case "completed":
      return "Completed"
    case "cancelled":
      return "Cancelled"
    case "onHold":
      return "On Hold"
    default:
      return status
  }
}

export const getActionStatusClasses = (actionType: "success" | "pending" | "cancelled") => {
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

export const getActionStatusIcon = (actionType: "success" | "pending" | "cancelled") => {
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

export const getActionStatusColor = (actionType: "success" | "pending" | "cancelled") => {
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
