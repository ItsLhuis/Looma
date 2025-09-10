import { reorderTask } from "@/features/tasks/api/dal"

import { ZodError } from "zod"

import type { ReorderTasksRequest } from "@/features/tasks/api/types"

type Params = { params: Promise<{ id: string }> }

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  })
}

function isZodError(error: unknown): error is ZodError {
  return error instanceof ZodError
}

export async function PATCH(request: Request, context: Params): Promise<Response> {
  try {
    const body: ReorderTasksRequest = await request.json()
    const { id } = await context.params
    const updated = await reorderTask(id, body.newPosition, body.newStatus)
    if (!updated) return jsonResponse({ error: "Not Found" }, 404)
    return jsonResponse({ data: updated })
  } catch (error: unknown) {
    let status = 500
    let message: unknown = "Internal Server Error"

    if (isZodError(error)) {
      status = 400
      message = error.issues
    } else if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        status = 401
      }
      message = error.message
    }

    return jsonResponse({ error: message }, status)
  }
}
