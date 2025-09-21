import { getTools } from "@/features/tools/registry/tool.registry"

export function generateToolDescriptions() {
  const tools = getTools()

  const toolDescriptions = Object.entries(tools)
    .map(([name, tool]) => {
      const description = tool.description || "No description available"
      return `- **${name}**: ${description}`
    })
    .join("\n")

  return {
    toolDescriptions,
    toolCount: Object.keys(tools).length,
    availableTools: Object.keys(tools)
  }
}

export function getFormattedTools() {
  const { toolDescriptions, toolCount, availableTools } = generateToolDescriptions()

  return {
    summary: `Available Tools (${toolCount} total):`,
    tools: toolDescriptions,
    list: availableTools
  }
}

export function getDetailedToolInfo() {
  const tools = getTools()

  return Object.entries(tools).map(([name, tool]) => ({
    name,
    description: tool.description,
    hasExecute: typeof tool.execute === "function",
    schema: tool.inputSchema
  }))
}
