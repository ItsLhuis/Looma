import { eventTools } from "@/features/calendar/tools"
import { noteTools } from "@/features/notes/tools"
import { taskTools } from "@/features/tasks/tools"

export const tools = {
  ...noteTools,
  ...taskTools,
  ...eventTools
}

export function getTools() {
  return tools
}
