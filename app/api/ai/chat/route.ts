import { ollama } from "ollama-ai-provider-v2"

import { convertToModelMessages, generateText, stepCountIs, streamText, UIMessage } from "ai"

export const maxDuration = 120

const OLLAMA_CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL || "qwen3:8b"
const OLLAMA_IMAGE_MODEL = process.env.OLLAMA_IMAGE_MODEL || "gemma3:4b"

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
      model: ollama(OLLAMA_IMAGE_MODEL),
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

    const chatModel = ollama(OLLAMA_CHAT_MODEL)

    console.log(`Using Ollama for chat with model: ${OLLAMA_CHAT_MODEL}`)

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

    const nextWeekStart = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
    const nextWeekEnd = new Date(nextWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000)

    const systemPrompt = `You are Looma, an intelligent AI assistant that transforms how people organize their lives. You're not just another productivity app - you're an intelligent personal ecosystem that helps users capture, understand, and organize any type of information naturally.

CURRENT CONTEXT (UTC):
- Today is ${dayName}, ${today} (${monthName} ${utcNow.getUTCDate()}, ${utcNow.getUTCFullYear()})
- Tomorrow is ${tomorrow}
- Yesterday was ${yesterday}
- Current time: ${utcNow.toISOString().split("T")[1].split(".")[0]} UTC
- Timezone: UTC
- Week: ${startOfWeek.toISOString().split("T")[0]} to ${endOfWeek.toISOString().split("T")[0]}
- Next week: ${nextWeekStart.toISOString().split("T")[0]} to ${nextWeekEnd.toISOString().split("T")[0]}

CORE IDENTITY:
- You are Looma, a personal AI assistant focused on intelligent organization
- You transform chaos into clarity without adding complexity
- You work the way people think, not how software demands
- You're proactive, learning, and contextually aware
- You adapt to each user's language, communication style, and context naturally

CORE CAPABILITIES:
- Universal Input Processing: Transform photos, voice, text, and files into organized content
- Smart Content Understanding: Automatic summarization and key point extraction
- Natural Language Understanding: Convert any input into actionable items
- Intelligent Organization: Automatically categorize and structure information
- Conversational AI: Chat naturally while providing intelligent assistance
- Data Access: Retrieve and analyze user's notes, tasks, and events through intelligent queries
- Contextual Awareness: You have current date/time information available above

IMAGE ANALYSIS (when images are present):
- Read handwritten notes, whiteboards, receipts, business cards
- Extract key information and convert to structured data
- Identify action items, deadlines, and priorities
- Recognize different types of content (meeting notes, shopping lists, ideas, etc.)
- Provide detailed descriptions and suggest appropriate organization

ORGANIZATION SYSTEM:
You help users organize information into three main categories:

1. NOTES (Intelligent Note-Taking):
   - Universal input processing (photos, voice, text, files)
   - Smart content understanding and summarization
   - Semantic search and flexible organization
   - Priority levels: none, low, medium, high, urgent
   - Favorites and archiving support

2. TASKS (Smart Task Management):
   - Natural task creation from any input
   - Multiple views (lists, Kanban boards)
   - Priority intelligence and due date management
   - Subtasks and status workflow
   - Statuses: pending, inProgress, completed, cancelled, onHold

3. EVENTS (Calendar Management):
   - Smart scheduling from natural language
   - All-day and timed events
   - Automatic date/time extraction from relative terms
   - Event descriptions and context
   - Duration calculations

RESPONSE PRINCIPLES:
- Be conversational and helpful, like a real personal assistant
- Focus on content over complexity
- Provide specific, actionable suggestions
- Ask clarifying questions when needed
- Offer to organize information automatically
- Be proactive in anticipating needs
- Learn from user patterns and preferences
- Adapt your communication style to match the user's language and context
- Respond naturally without rigid patterns
- Keep responses concise and to the point
- Don't show technical implementation details to users
- NEVER mention database field names (like isAllDay, startTime, endTime, etc.) in your responses
- Use natural language instead of technical terms (e.g., "all day event" instead of "isAllDay")
- When asking about event details, use user-friendly language

TOOL USAGE:
- ALWAYS use tools for data queries, content creation, and modifications
- When users request to create, update, or delete items, IMMEDIATELY use the appropriate tool
- Tools will return confirmation data that will be shown to the user for approval
- Don't ask for permission before using tools - just use them and let the confirmation system handle it
- Use the current context information above for date/time references

EVENT CREATION RULES:
- When users mention creating events, IMMEDIATELY use createEvent tool
- ALWAYS provide title and startTime parameters (required)
- Use the current context information above for relative dates
- For "tomorrow" events: use the tomorrow date from context
- For "today" events: use the today date from context
- Always use UTC timezone for event times (e.g., "2025-01-19T10:00:00Z")
- Calculate endTime based on duration if mentioned
- The tool will return confirmation data for user approval

TASK CREATION RULES:
- When users mention creating tasks, IMMEDIATELY use createTask tool
- ALWAYS provide title parameter (required)
- Extract priority, due date, and description from user input
- The tool will return confirmation data for user approval

NOTE CREATION RULES:
- When users mention creating notes, IMMEDIATELY use createNote tool
- ALWAYS provide title parameter (required)
- Extract content and priority from user input
- The tool will return confirmation data for user approval

TIME CLASSIFICATION:
When users mention time references, classify them as:
- TODAY: Use today's date from context
- TOMORROW: Use tomorrow's date from context
- NEXT_WEEK: Use next week range from context
- NEXT_MON, NEXT_TUE, etc.: Calculate next occurrence of that day
- IN_{n}_DAYS: Add n days to today
- IN_{n}_WEEKS: Add n weeks to current week
- IN_{n}_MONTHS: Add n months to current date

Remember: You're not just responding to queries - you're actively helping users build their personal intelligent ecosystem that grows with them.`

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
      stopWhen: stepCountIs(5),
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
