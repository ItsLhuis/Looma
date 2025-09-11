import type { Task } from "@/features/tasks/types"

export type HierarchicalTask = Task & {
  children?: HierarchicalTask[]
  depth: number
  isExpanded?: boolean
  hasChildren: boolean
  parentPath: string[]
}

export type FlattenedTask = Task & {
  depth: number
  isExpanded?: boolean
  hasChildren: boolean
  parentPath: string[]
  isVisible: boolean
  hierarchyKey: string
}

export type HierarchyState = {
  expandedIds: Set<string>
  collapsedIds: Set<string>
}

export type PositionCalculation = {
  newPosition: number
  affectedTasks: { id: string; newPosition: number }[]
}

export function buildHierarchy(tasks: Task[]): HierarchicalTask[] {
  const taskMap = new Map<string, HierarchicalTask>()
  const rootTasks: HierarchicalTask[] = []

  tasks.forEach((task) => {
    const hierarchicalTask: HierarchicalTask = {
      ...task,
      depth: 0,
      hasChildren: false,
      parentPath: [],
      children: []
    }
    taskMap.set(task.id, hierarchicalTask)
  })

  tasks.forEach((task) => {
    const hierarchicalTask = taskMap.get(task.id)!

    if (task.parentTaskId) {
      const parent = taskMap.get(task.parentTaskId)
      if (parent) {
        hierarchicalTask.depth = parent.depth + 1
        hierarchicalTask.parentPath = [...parent.parentPath, parent.id]
        parent.hasChildren = true
        if (!parent.children) parent.children = []
        parent.children.push(hierarchicalTask)
      } else {
        rootTasks.push(hierarchicalTask)
      }
    } else {
      rootTasks.push(hierarchicalTask)
    }
  })

  function sortChildren(task: HierarchicalTask) {
    if (task.children) {
      task.children.sort((a, b) => a.position - b.position)
      task.children.forEach(sortChildren)
    }
  }

  rootTasks.sort((a, b) => a.position - b.position)
  rootTasks.forEach(sortChildren)

  return rootTasks
}

export function flattenHierarchy(
  hierarchicalTasks: HierarchicalTask[],
  hierarchyState: HierarchyState
): FlattenedTask[] {
  const result: FlattenedTask[] = []

  function traverse(task: HierarchicalTask, isVisible = true) {
    const isExpanded = hierarchyState.expandedIds.has(task.id)
    const flatTask: FlattenedTask = {
      ...task,
      isExpanded,
      isVisible,
      hierarchyKey: `${task.parentPath.join("-")}-${task.id}`
    }

    result.push(flatTask)

    if (task.children && isExpanded && isVisible) {
      task.children.forEach((child) => traverse(child, true))
    } else if (task.children && !isVisible) {
      task.children.forEach((child) => traverse(child, false))
    }
  }

  hierarchicalTasks.forEach((task) => traverse(task))
  return result
}

export function calculateNewPosition(
  tasks: Task[],
  draggedTaskId: string,
  targetColumn: string,
  insertIndex: number,
  newParentId?: string | null
): PositionCalculation {
  const columnTasks = tasks
    .filter(
      (t) => t.status === targetColumn && t.parentTaskId === newParentId && t.id !== draggedTaskId
    )
    .sort((a, b) => a.position - b.position)

  let newPosition: number
  const affectedTasks: { id: string; newPosition: number }[] = []

  if (columnTasks.length === 0) {
    newPosition = 1000
  } else if (insertIndex === 0) {
    const firstPosition = columnTasks[0].position
    newPosition = firstPosition > 1000 ? firstPosition / 2 : firstPosition - 1000
  } else if (insertIndex >= columnTasks.length) {
    const lastPosition = columnTasks[columnTasks.length - 1].position
    newPosition = lastPosition + 1000
  } else {
    const prevPosition = columnTasks[insertIndex - 1].position
    const nextPosition = columnTasks[insertIndex].position
    const positionDiff = nextPosition - prevPosition

    if (positionDiff > 2) {
      newPosition = prevPosition + positionDiff / 2
    } else {
      newPosition = prevPosition + 1000
      for (let i = insertIndex; i < columnTasks.length; i++) {
        affectedTasks.push({
          id: columnTasks[i].id,
          newPosition: columnTasks[i].position + 1000
        })
      }
    }
  }

  return { newPosition, affectedTasks }
}

export function validateHierarchyMove(
  tasks: Task[],
  draggedTaskId: string,
  newParentId: string | null
): { isValid: boolean; reason?: string } {
  if (!newParentId) {
    return { isValid: true }
  }

  if (draggedTaskId === newParentId) {
    return { isValid: false, reason: "Task cannot be its own parent" }
  }

  const taskMap = new Map(tasks.map((t) => [t.id, t]))
  const draggedTask = taskMap.get(draggedTaskId)

  if (!draggedTask) {
    return { isValid: false, reason: "Dragged task not found" }
  }

  let currentParentId: string | null = newParentId
  const visitedIds = new Set<string>()

  while (currentParentId) {
    if (visitedIds.has(currentParentId)) {
      return { isValid: false, reason: "Circular reference detected" }
    }

    if (currentParentId === draggedTaskId) {
      return { isValid: false, reason: "Cannot move task under its own descendant" }
    }

    visitedIds.add(currentParentId)
    const parentTask = taskMap.get(currentParentId)
    currentParentId = parentTask?.parentTaskId || null
  }

  return { isValid: true }
}

export function getDescendantIds(tasks: Task[], parentId: string): string[] {
  const descendants: string[] = []
  const children = tasks.filter((t) => t.parentTaskId === parentId)

  children.forEach((child) => {
    descendants.push(child.id)
    descendants.push(...getDescendantIds(tasks, child.id))
  })

  return descendants
}

export function toggleExpansion(hierarchyState: HierarchyState, taskId: string): HierarchyState {
  const newExpandedIds = new Set(hierarchyState.expandedIds)
  const newCollapsedIds = new Set(hierarchyState.collapsedIds)

  if (newExpandedIds.has(taskId)) {
    newExpandedIds.delete(taskId)
    newCollapsedIds.add(taskId)
  } else {
    newExpandedIds.add(taskId)
    newCollapsedIds.delete(taskId)
  }

  return {
    expandedIds: newExpandedIds,
    collapsedIds: newCollapsedIds
  }
}

export function expandToTask(
  hierarchyState: HierarchyState,
  tasks: Task[],
  taskId: string
): HierarchyState {
  const taskMap = new Map(tasks.map((t) => [t.id, t]))
  const task = taskMap.get(taskId)

  if (!task) return hierarchyState

  const newExpandedIds = new Set(hierarchyState.expandedIds)
  const newCollapsedIds = new Set(hierarchyState.collapsedIds)

  let currentParentId = task.parentTaskId
  while (currentParentId) {
    newExpandedIds.add(currentParentId)
    newCollapsedIds.delete(currentParentId)

    const parentTask = taskMap.get(currentParentId)
    currentParentId = parentTask?.parentTaskId || null
  }

  return {
    expandedIds: newExpandedIds,
    collapsedIds: newCollapsedIds
  }
}
