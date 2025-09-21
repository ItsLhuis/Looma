import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { ollama } from "ollama-ai-provider-v2"

import { convertToModelMessages, generateText, stepCountIs, streamText, UIMessage } from "ai"

import { getUser } from "@/lib/dal.server"

import { getTools } from "@/features/tools/registry"

import { getFormattedTools } from "@/lib/tools"

export const maxDuration = 120

const AI_PROVIDER = process.env.AI_PROVIDER || "ollama"

const OLLAMA_CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL || "qwen3:8b"
const OLLAMA_IMAGE_MODEL = process.env.OLLAMA_IMAGE_MODEL || "gemma3:4b"

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_CHAT_MODEL =
  process.env.OPENROUTER_CHAT_MODEL || "deepseek/deepseek-chat-v3.1:free"
const OPENROUTER_IMAGE_MODEL =
  process.env.OPENROUTER_IMAGE_MODEL || "deepseek/deepseek-chat-v3.1:free"

const openrouter = OPENROUTER_API_KEY
  ? createOpenRouter({
      apiKey: OPENROUTER_API_KEY
    })
  : null

function getChatModel() {
  if (AI_PROVIDER === "openrouter") {
    if (!openrouter) {
      throw new Error("OPENROUTER_API_KEY is required when using OpenRouter provider")
    }
    return openrouter.chat(OPENROUTER_CHAT_MODEL)
  }
  return ollama(OLLAMA_CHAT_MODEL)
}

function getImageModel() {
  if (AI_PROVIDER === "openrouter") {
    if (!openrouter) {
      throw new Error("OPENROUTER_API_KEY is required when using OpenRouter provider")
    }
    return openrouter.chat(OPENROUTER_IMAGE_MODEL)
  }
  return ollama(OLLAMA_IMAGE_MODEL)
}

function hasImages(messages: UIMessage[]): boolean {
  return messages.some((message) => {
    if (message.role !== "user") return false

    const content = message.parts
    if (Array.isArray(content)) {
      return content.some((part) => part.type === "file" && part.mediaType?.startsWith("image/"))
    }
    return false
  })
}

async function analyzeImages(messages: UIMessage[]): Promise<string> {
  const imageAnalysisPrompt = `You are an image analysis AI. Your job is to analyze images and extract structured information from them.

When analyzing images, focus on:
- Text content (handwritten or printed)
- Dates, times, and deadlines
- Names, titles, and important details
- Action items or tasks mentioned
- Any structured data (tables, lists, forms)
- Context clues about the type of document (receipt, note, business card, etc.)

Provide a detailed, structured description of what you see in the image. Be specific about:
1. Type of document/content
2. Key information extracted (dates, names, amounts, etc.)
3. Any action items or tasks mentioned
4. Context that would help understand the purpose

Format your response as a clear, structured description that can be used as context for further processing.`

  const imageMessages = messages.filter((message) => {
    if (message.role !== "user") return false

    const content = message.parts
    if (Array.isArray(content)) {
      return content.some((part) => part.type === "file" && part.mediaType?.startsWith("image/"))
    }
    return false
  })

  if (imageMessages.length === 0) return ""

  try {
    const result = await generateText({
      model: getImageModel(),
      system: imageAnalysisPrompt,
      messages: convertToModelMessages(imageMessages),
      maxOutputTokens: 500
    })

    return result.text
  } catch (error) {
    console.error("Image analysis error:", error)
    return "Unable to analyze the provided image(s)."
  }
}

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json()

    const user = await getUser()
    if (!user) throw new Error("UNAUTHORIZED")

    const chatModel = getChatModel()

    let imageAnalysis = ""
    if (hasImages(messages)) {
      imageAnalysis = await analyzeImages(messages)
    }

    const now = new Date()
    const utcNow = new Date(now.toISOString())

    const today = utcNow.toISOString().split("T")[0]
    const tomorrow = new Date(utcNow.getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    const yesterday = new Date(utcNow.getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    const dayName = utcNow.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" })
    const monthName = utcNow.toLocaleDateString("en-US", { month: "long", timeZone: "UTC" })

    const dayOfWeek = utcNow.getUTCDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const startOfWeek = new Date(utcNow.getTime() + mondayOffset * 24 * 60 * 60 * 1000)
    const endOfWeek = new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000)

    const { tools: toolDescriptions } = getFormattedTools()

    const systemPrompt = `You are Looma, an AI assistant that helps organize information through natural conversation.

## CONTEXT
- Yesterday: ${yesterday}
- Today: ${dayName}, ${today} (${monthName} ${utcNow.getUTCDate()}, ${utcNow.getUTCFullYear()})
- Tomorrow: ${tomorrow}
- Week: ${startOfWeek.toISOString().split("T")[0]} to ${endOfWeek.toISOString().split("T")[0]}
- User: ${user.name}

## CAPABILITIES
- Process photos, voice, text, and files into organized content
- Create and manage notes, tasks, and calendar events
- Extract key information from images (handwritten notes, receipts, etc.)
- Use tools for data queries and modifications

## ORGANIZATION SYSTEM
**NOTES**: Priority levels (none, low, medium, high, urgent), favorites, archiving
**TASKS**: Statuses (pending, inProgress, completed, cancelled, onHold), subtasks, due dates
**EVENTS**: All-day and timed events, natural language scheduling

## TOOL USAGE
- Use tools immediately for data queries and actions
- Tools return confirmation data for user approval
- Keep internal IDs/technical details internal - never expose to users
- Maintain context of created/modified entities
- CRITICAL: Always include ALL required fields when calling tools - check tool descriptions for mandatory fields
- When updating any entity, include the title/name field if it's required by the tool schema
- When deleting any entity, include the title/name field if it's required by the tool schema
- If user asks to update without specifying a new title/name, use the existing title/name from the entity
- Never call tools without including all mandatory fields specified in their schemas
- Read tool descriptions carefully to understand which fields are required vs optional
- When thinking about tool usage, never mention specific field names, tool names, or technical parameters
- Think in terms of user intentions: "organize this information" not "call createNote with title, content, priority"
- Match user intent to the most appropriate tool based on the description keywords and user's natural language
- Choose tools that best match the user's request - statistics tools for analytics, list tools for browsing, search tools for finding specific content
- CRITICAL: Always call the correct tool name - never call tools with empty names or invalid names
- When user asks for statistics or analytics, use the appropriate statistics tool from the available tools list

## AVAILABLE TOOLS
${toolDescriptions}

## RESPONSE RULES
- Be conversational and helpful
- Handle errors naturally: "Oops! Let me fix that..." instead of technical apologies
- Present data in natural language, never raw JSON or technical outputs
- Never expose IDs, UUIDs, or technical identifiers
- Never return database field names or technical terms (like "Is Favorite: False", "Priority: Low", etc.)
- Never return raw tool responses, JSON data, or API objects
- Always format information in natural, conversational language
- When showing data, present it as if you're summarizing it personally
- Continue conversations naturally after tool results
- Never show technical implementation details to users
- Use natural language instead of technical terms
- Always filter out technical details and present only user-relevant information
- When mentioning note properties, use natural language: "This is a favorite note" instead of "Is Favorite: True"
- When mentioning priority, use natural language: "This is a high priority note" instead of "Priority: High"
- CRITICAL: Never output raw JSON, API responses, or technical data structures - always convert to natural language
- When presenting statistics or data, format it as a conversational summary, not as raw data

## THINKING PROCESS RULES
- When thinking through problems, use only natural, conversational language
- Never mention specific field names, function names, or technical identifiers in your thinking
- Never reference tool names, API endpoints, or database schemas in your reasoning
- Think in terms of user goals and outcomes, not technical implementation details
- Use general terms like "organize this information" instead of specific technical actions
- Focus on what the user wants to achieve, not how the system works internally
- Keep your internal reasoning completely free of technical jargon or system-specific terminology
- When processing tool results, always think about how to present the information naturally to the user
- Never think about outputting raw data - always think about converting it to conversational language

## ENTITY MANAGEMENT RULES
- When user asks to edit/update any entity, ALWAYS include all required fields in the tool call
- If user doesn't specify a new title/name, use the existing title/name from the entity
- If user specifies a new title/name, use that new title/name
- For multiple edits to the same entity, always include all required fields in every tool call
- Never assume any required field is optional - check the tool schema for mandatory fields
- When creating entities, include all required fields as specified in the tool description
- When deleting entities, include all required fields as specified in the tool description`

    let processedMessages = messages

    if (imageAnalysis) {
      processedMessages = messages.map((message, index) => {
        if (message.role === "user" && index === messages.length - 1) {
          const originalContent = message.parts
          const imageContext = `\n\n[Image Analysis: ${imageAnalysis}]`

          if (typeof originalContent === "string") {
            return {
              ...message,
              content: originalContent + imageContext
            }
          } else if (Array.isArray(originalContent)) {
            return {
              ...message,
              content: [
                ...originalContent,
                {
                  type: "text",
                  text: imageContext
                }
              ]
            }
          }
        }
        return message
      })
    }

    const result = streamText({
      model: chatModel,
      system: imageAnalysis
        ? `${systemPrompt}\n\nCURRENT IMAGE ANALYSIS:\n${imageAnalysis}\n\nUse the image analysis above to understand what the user has shared and provide appropriate assistance based on the image content.`
        : systemPrompt,
      messages: convertToModelMessages(processedMessages),
      maxOutputTokens: 1000,
      stopWhen: stepCountIs(20),
      tools: getTools(),
      onStepFinish: ({ toolCalls, toolResults }) => {
        console.log(
          `Step finished: ${toolCalls?.length || 0} tool calls, ${toolResults?.length || 0} tool results`
        )
      }
    })

    return result.toUIMessageStreamResponse({
      onError: (error) => {
        console.error("Chat API Error:", error)

        if (error == null) {
          return "An unknown error occurred."
        }

        if (typeof error === "string") {
          return error
        }

        if (error instanceof Error) {
          return error.message
        }

        return "An error occurred while processing your request."
      }
    })
  } catch (error) {
    console.error("Chat API Error:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    )
  }
}
