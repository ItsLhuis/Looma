import { getTools } from "@/features/tools/registry/tool.registry"

export function generateToolDescriptions() {
  const tools = getTools()

  const toolDescriptions = Object.entries(tools)
    .map(([name, tool]) => {
      const description = tool.description || "No description available"
      const schema = tool.inputSchema

      let parameters = ""
      if (schema && typeof schema === "object" && "shape" in schema) {
        const shape = (schema as { shape: Record<string, unknown> }).shape
        const paramList = Object.entries(shape)
          .map(([key, value]: [string, unknown]) => {
            const val = value as { isOptional?: () => boolean; _def?: { typeName?: string } }
            const isOptional = val.isOptional?.() || false
            const type = val._def?.typeName || "unknown"
            return `${key}${isOptional ? "?" : ""} (${type})`
          })
          .join(", ")

        if (paramList) {
          parameters = `\n  Parameters: ${paramList}`
        }
      }

      return `- **${name}**: ${description}${parameters}`
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
