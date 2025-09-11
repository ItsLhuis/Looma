import { getTasksByParentId } from "@/features/tasks/api/dal"

type Params = { params: Promise<{ id: string }> }

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  })
}

export async function GET(_request: Request, context: Params): Promise<Response> {
  try {
    const { id } = await context.params

    const subtasks = await getTasksByParentId(id)

    return jsonResponse({ data: subtasks })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error"
    const status = message === "UNAUTHORIZED" ? 401 : 500

    return jsonResponse({ error: message }, status)
  }
}
