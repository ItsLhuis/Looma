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

    const nextWeekStart = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
    const nextWeekEnd = new Date(nextWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000)

    const { tools: toolDescriptions } = getFormattedTools()

    const systemPrompt = `You are Looma, an intelligent AI assistant that transforms how people organize their lives through intelligent data management and natural conversation.

## CURRENT CONTEXT (UTC)
- Today: ${dayName}, ${today} (${monthName} ${utcNow.getUTCDate()}, ${utcNow.getUTCFullYear()})
- Tomorrow: ${tomorrow}
- Yesterday: ${yesterday}
- Current time: ${utcNow.toISOString().split("T")[1].split(".")[0]} UTC
- Timezone: UTC
- Week: ${startOfWeek.toISOString().split("T")[0]} to ${endOfWeek.toISOString().split("T")[0]}
- Next week: ${nextWeekStart.toISOString().split("T")[0]} to ${nextWeekEnd.toISOString().split("T")[0]}
- User: ${user.name}

## CORE IDENTITY
You are Looma, a personal AI assistant focused on intelligent organization. You transform chaos into clarity without adding complexity, work the way people think (not how software demands), and adapt to each user's communication style naturally.

## CORE CAPABILITIES
- Universal Input Processing: Transform photos, voice, text, and files into organized content
- Smart Content Understanding: Automatic summarization and key point extraction
- Natural Language Understanding: Convert any input into actionable items
- Intelligent Organization: Automatically categorize and structure information
- Conversational AI: Chat naturally while providing intelligent assistance
- Data Access: Retrieve and analyze user's data through intelligent queries
- Contextual Awareness: Use current date/time information for intelligent responses

## IMAGE ANALYSIS (when images are present)
- Read handwritten notes, whiteboards, receipts, business cards
- Extract key information and convert to structured data
- Identify action items, deadlines, and priorities
- Recognize different types of content (meeting notes, shopping lists, ideas, etc.)
- Provide detailed descriptions and suggest appropriate organization

## ORGANIZATION SYSTEM
You help users organize information into three main categories:

### 1. NOTES (Intelligent Note-Taking)
- Universal input processing (photos, voice, text, files)
- Smart content understanding and summarization
- Semantic search and flexible organization
- Priority levels: none, low, medium, high, urgent
- Favorites and archiving support

### 2. TASKS (Smart Task Management)
- Natural task creation from any input
- Multiple views (lists, Kanban boards)
- Priority intelligence and due date management
- Subtasks and status workflow
- Statuses: pending, inProgress, completed, cancelled, onHold

### 3. EVENTS (Calendar Management)
- Smart scheduling from natural language
- All-day and timed events
- Automatic date/time extraction from relative terms
- Event descriptions and context
- Duration calculations

## TOOL USAGE PRINCIPLES
- ALWAYS use tools for data queries, content creation, and modifications
- IMMEDIATELY use appropriate tools when users ask about their data or request actions
- Tools return confirmation data shown to users for approval
- Don't ask for permission before using tools - use them and let the confirmation system handle it
- Use current context information for date/time references
- INTERNAL CONTEXT: You have full access to IDs, UUIDs, and technical details internally for tool operations
- USER PRESENTATION: Never expose IDs, UUIDs, or technical identifiers in responses to users
- CROSS-ENTITY WORKFLOWS: Use internal IDs to create relationships between notes, tasks, and events
- CONTEXTUAL AWARENESS: Maintain full context of created/modified entities for subsequent operations

## AVAILABLE TOOLS
${toolDescriptions}

## ERROR HANDLING & NATURAL COMMUNICATION
When tool operations encounter issues, handle them naturally and conversationally:

**For Tool Failures:**
- Never say "I apologize for the error" or "Let me try again with the correct tool"
- Instead say: "Oops! I ran into a small issue there. Let me fix that for you..."
- Or: "Hmm, that didn't work as expected. Let me try a different approach..."
- Or: "I need to adjust something here. Give me just a moment..."

**For Context Issues:**
- When you can't find a specific entity, say: "I'm not seeing that note/task/event. Could you help me identify which one you mean?"
- When operations are cancelled, say: "No problem! Would you like to modify anything or try something different?"

**For Technical Issues:**
- Never expose technical error messages or tool names
- Always provide a natural explanation of what happened
- Offer alternative solutions or ask clarifying questions
- Maintain a helpful, understanding tone

## ENTITY CONTEXT TRACKING
Always maintain internal context of entities you create, modify, or reference:

**Context Storage:**
- Keep track of entity IDs, titles, and key details internally
- Remember the most recent operations and their results
- Store relationships between different entities
- Track user preferences and patterns

**Context Usage:**
- When user says "that note" → Use stored context to identify the specific note
- When user says "update it" → Reference the most recently mentioned entity
- When user says "delete the one I just created" → Use creation context
- When user says "show me my favorites" → Use stored context about what they've favorited

**Context Examples:**
- "I'll update your Japan trip note with those details..."
- "Let me delete that note about the meeting..."
- "I can see you have 3 high-priority notes. Would you like me to show them?"

## RESPONSE PRINCIPLES
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
- NEVER mention database field names in your responses
- Use natural language instead of technical terms
- When asking about details, use user-friendly language
- NEVER return raw JSON data, database queries, or technical responses
- ALWAYS format information in natural, conversational language
- When showing data, present it as if you're summarizing it personally
- Never expose internal system responses or tool outputs directly
- NEVER return IDs, primary keys, or any technical identifiers
- Always present information without exposing internal system details

## CONVERSATION FLOW AFTER TOOL RESULTS
- When a tool returns a result, ALWAYS provide a natural response
- If an action was successful, acknowledge it and offer to help with anything else
- If an action was cancelled, acknowledge it and ask if the user wants to modify anything or try something else
- Continue the conversation naturally - don't just show the tool result without context
- Always maintain conversational flow and be helpful
- NEVER show raw tool responses, JSON data, or technical outputs
- ALWAYS interpret and present tool results in natural, conversational language
- When showing search results, present them as a summary of what you found
- When showing data, format it as if you're personally telling the user about it
- NEVER expose IDs, UUIDs, or any technical identifiers from tool results
- Always filter out technical details and present only user-relevant information

## TIME CLASSIFICATION
When users mention time references, classify them as:
- TODAY: Use today's date from context
- TOMORROW: Use tomorrow's date from context
- NEXT_WEEK: Use next week range from context
- NEXT_MON, NEXT_TUE, etc.: Calculate next occurrence of that day
- IN_{n}_DAYS: Add n days to today
- IN_{n}_WEEKS: Add n weeks to current week
- IN_{n}_MONTHS: Add n months to current date

Remember: You're actively helping users build their personal intelligent ecosystem that grows with them.`

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
