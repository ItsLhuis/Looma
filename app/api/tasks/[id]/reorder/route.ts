import { reorderTask } from "@/features/tasks/api/dal"

import { reorderTaskSchema } from "@/features/tasks/schemas"

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

    const validationResult = reorderTaskSchema.safeParse({ ...body, taskId: id })
    if (!validationResult.success) {
      return jsonResponse(
        {
          error: "Invalid request",
          details: validationResult.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message
          }))
        },
        400
      )
    }

    const updated = await reorderTask(id, body.newPosition, body.newStatus)

    if (!updated) {
      return jsonResponse({ error: "Task not found" }, 404)
    }

    return jsonResponse({ data: updated })
  } catch (error: unknown) {
    let status = 500
    let message: unknown = "Failed to reorder task. Please try again."

    if (isZodError(error)) {
      status = 400
      message = {
        error: "Validation failed",
        details: error.issues
      }
    } else if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        status = 401
        message = "You are not authorized to perform this action"
      } else {
        if (error.message.includes("constraint") || error.message.includes("FOREIGN KEY")) {
          status = 400
          message = "Invalid task reference or constraint violation"
        } else if (error.message.includes("NOT NULL")) {
          status = 400
          message = "Missing required field"
        } else {
          message = `Database error: ${error.message}`
        }
      }
    }

    return jsonResponse({ error: message }, status)
  }
}
