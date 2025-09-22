import { noteTools } from "@/features/notes/tools"
import { taskTools } from "@/features/tasks/tools"

export const tools = {
  ...noteTools,
  ...taskTools
}

export function getTools() {
  return tools
}
