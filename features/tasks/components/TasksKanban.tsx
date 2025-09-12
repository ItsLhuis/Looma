"use client"

import { useCallback, useMemo, useState } from "react"

import { useListTasks, useReorderTask } from "@/features/tasks/api"

import {
  Button,
  Kanban,
  Skeleton,
  Spinner,
  Typography,
  type HierarchicalKanbanCardType,
  type KanbanColumnConfig
} from "@/components/ui"

import {
  buildHierarchy,
  flattenHierarchy,
  toggleExpansion,
  validateHierarchyMove,
  type HierarchyState
} from "../utils/hierarchy.utils"

import { type TaskPriority, type TaskStatus } from "@/features/tasks/types"

const statusColumns: KanbanColumnConfig[] = [
  { id: "pending", title: "Pending", color: "text-muted-foreground" },
  { id: "inProgress", title: "In Progress", color: "text-info" },
  { id: "onHold", title: "On Hold", color: "text-warning" },
  { id: "completed", title: "Completed", color: "text-success" },
  { id: "cancelled", title: "Cancelled", color: "text-error" }
]

export type TasksKanbanProps = {
  initialParams?: {
    search?: string
    priority?: TaskPriority | TaskPriority[]
    dueDate?: { from?: Date; to?: Date }
    parentTaskId?: string | null
  }
}

function TasksKanban({ initialParams }: TasksKanbanProps) {
  const [hierarchyState, setHierarchyState] = useState<HierarchyState>(() => ({
    expandedIds: new Set<string>(),
    collapsedIds: new Set<string>()
  }))

  const [params] = useState({
    offset: 0,
    filters: {
      ...initialParams
    }
  })

  const { data, isLoading, isError, isFetching } = useListTasks(params)
  const reorderMutation = useReorderTask()

  const tasks = useMemo(() => {
    return data?.data ?? []
  }, [data?.data])

  const hierarchicalTasks = useMemo(() => {
    if (tasks.length === 0) return []
    return buildHierarchy(tasks)
  }, [tasks])

  const flattenedTasks = useMemo(() => {
    if (hierarchicalTasks.length === 0) return []
    return flattenHierarchy(hierarchicalTasks, hierarchyState).filter((t) => t.isVisible)
  }, [hierarchicalTasks, hierarchyState])

  const handleToggleExpansion = useCallback((taskId: string) => {
    setHierarchyState((prevState) => toggleExpansion(prevState, taskId))
  }, [])

  const handleFocusParent = useCallback((parentId: string) => {
    setHierarchyState((prevState) => {
      if (!prevState.expandedIds.has(parentId)) {
        return toggleExpansion(prevState, parentId)
      }
      return prevState
    })
  }, [])

  const kanbanCards: HierarchicalKanbanCardType[] = useMemo(() => {
    const taskMap = new Map(tasks.map((t) => [t.id, t]))

    return flattenedTasks.map((task) => {
      const parentTask = task.parentTaskId ? taskMap.get(task.parentTaskId) : null

      return {
        id: task.id,
        title: task.title,
        description: task.description || undefined,
        column: task.status,
        priority: task.priority === "none" ? undefined : task.priority,
        assignee: undefined,
        depth: task.depth,
        isExpanded: task.isExpanded,
        hasChildren: task.hasChildren,
        parentPath: task.parentPath,
        hierarchyKey: task.hierarchyKey,
        parentTaskId: task.parentTaskId,
        parentTaskTitle: parentTask?.title,
        onToggleExpansion: handleToggleExpansion,
        onFocusParent: handleFocusParent
      }
    })
  }, [flattenedTasks, tasks, handleToggleExpansion, handleFocusParent])

  const handleHierarchicalMove = useCallback(
    async (params: {
      cardId: string
      newColumn: string
      newPosition: number
      newParentId?: string | null
      insertIndex: number
    }) => {
      const { cardId, newColumn, insertIndex } = params

      try {
        const newPosition = insertIndex * 1000

        await reorderMutation.mutateAsync({
          taskId: cardId,
          newPosition: newPosition,
          newStatus: newColumn as TaskStatus
        })
      } catch (error) {
        throw error
      }
    },
    [reorderMutation]
  )

  const handleValidateMove = useCallback(
    (params: { cardId: string; newParentId: string | null }) => {
      return validateHierarchyMove(tasks, params.cardId, params.newParentId)
    },
    [tasks]
  )

  const visibleTasksCount = flattenedTasks.length
  const totalTasksCount = tasks.length

  const headerContent = (
    <div className="flex min-h-8 items-center justify-between">
      <Typography affects={["lead", "bold"]}>
        {isFetching ? <Spinner /> : `${visibleTasksCount} of ${totalTasksCount} tasks visible`}
      </Typography>
    </div>
  )

  const actionsContent = (
    <div className="flex w-full justify-end gap-2">
      <Button
        variant="outline"
        onClick={() =>
          setHierarchyState({
            expandedIds: new Set(tasks.filter((t) => t.parentTaskId).map((t) => t.parentTaskId!)),
            collapsedIds: new Set()
          })
        }
      >
        Expand All
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          setHierarchyState({
            expandedIds: new Set(),
            collapsedIds: new Set(tasks.filter((t) => t.parentTaskId === null).map((t) => t.id))
          })
        }
      >
        Collapse All
      </Button>
    </div>
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        {headerContent}
        {actionsContent}
        <div className="grid h-full w-full grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3">
          <Skeleton className="h-[500px]" />
          <Skeleton className="h-[500px]" />
          <Skeleton className="h-[500px]" />
          <Skeleton className="h-[500px]" />
          <Skeleton className="h-[500px ]" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-4">
        {headerContent}
        {actionsContent}
        <div className="flex h-96 items-center justify-center">
          <Typography className="text-destructive" affects={["small"]}>
            Failed to load tasks
          </Typography>
        </div>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="space-y-4">
        {headerContent}
        {actionsContent}
        <div className="flex h-96 items-center justify-center">
          <Typography affects={["muted", "small"]}>No tasks found</Typography>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {headerContent}
      {actionsContent}
      <Kanban
        columns={statusColumns}
        initialCards={kanbanCards}
        hierarchical
        onHierarchicalMove={handleHierarchicalMove}
        onValidateMove={handleValidateMove}
        showDeleteZone={false}
      />
    </div>
  )
}

export { TasksKanban }
