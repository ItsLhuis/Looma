export function getActionStatusClasses(status: "cancelled" | "completed" | "pending") {
  switch (status) {
    case "cancelled":
      return "border-error/20 bg-error/5"
    case "completed":
      return "border-success/20 bg-success/5"
    case "pending":
      return "border-warning/20 bg-warning/5"
    default:
      return "border-muted/20 bg-muted/5"
  }
}

export function getActionStatusColor(status: "cancelled" | "completed" | "pending") {
  switch (status) {
    case "cancelled":
      return "text-error"
    case "completed":
      return "text-success"
    case "pending":
      return "text-warning"
    default:
      return "text-muted-foreground"
  }
}

export function getActionStatusIcon(status: "cancelled" | "completed" | "pending") {
  switch (status) {
    case "cancelled":
      return "X"
    case "completed":
      return "Check"
    case "pending":
      return "Clock"
    default:
      return "Info"
  }
}

export function getPriorityClasses(priority: string) {
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
