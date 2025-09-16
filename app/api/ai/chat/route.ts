import { ollama } from "ollama-ai-provider-v2"

import { convertToModelMessages, streamText, UIMessage } from "ai"

export const maxDuration = 120

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json()

    const hasImages = messages.some((msg) =>
      msg.parts?.some((part) => part.type === "file" && part.mediaType?.startsWith("image/"))
    )

    const modelName = "gemma3:4b"

    const systemPrompt = hasImages
      ? "You are a helpful AI assistant that can analyze images and provide detailed descriptions, analysis, and insights. Be thorough and helpful in your responses about visual content."
      : "You are a helpful AI assistant. Be concise and helpful in your responses."

    const result = streamText({
      model: ollama(modelName),
      system: systemPrompt,
      messages: convertToModelMessages(messages)
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
