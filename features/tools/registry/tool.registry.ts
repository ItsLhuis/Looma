import { eventTools } from "@/features/calendar/tools"
import { memoryTools } from "@/features/memories/tools"
import { noteTools } from "@/features/notes/tools"
import { taskTools } from "@/features/tasks/tools"

export const tools = {
  ...noteTools,
  ...taskTools,
  ...eventTools,
  ...memoryTools
}

export function getTools() {
  return tools
}
