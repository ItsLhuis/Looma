export type ActionStatus = "success" | "pending" | "cancelled"

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
