"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type DragEvent,
  type SetStateAction
} from "react"

import { cn } from "@/lib/utils"

import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader } from "@/components/ui/Card"
import { Icon } from "@/components/ui/Icon"
import { Typography } from "@/components/ui/Typography"

import { motion } from "motion/react"

export type KanbanColumnType = string

export type KanbanPriority = "none" | "low" | "medium" | "high" | "urgent"

export type KanbanCardType = {
  title: string
  id: string
  column: KanbanColumnType
  description?: string
  priority?: KanbanPriority
  assignee?: string
  parentTaskId?: string | null
  parentTaskTitle?: string
}

export type HierarchicalKanbanCardType = KanbanCardType & {
  depth?: number
  isExpanded?: boolean
  hasChildren?: boolean
  parentPath?: string[]
  isVisible?: boolean
  hierarchyKey?: string
  onToggleExpansion?: (cardId: string) => void
  onFocusParent?: (parentId: string) => void
}

export type ResponsiveKanbanConfig = {
  breakpoints: {
    mobile: number
    tablet: number
    desktop: number
  }
  columnsPerBreakpoint: {
    mobile: number
    tablet: number
    desktop: number
  }
  enableHorizontalScroll: boolean
  snapToColumns: boolean
}

export type KanbanColumnConfig = {
  id: KanbanColumnType
  title: string
  color?: string
  maxCards?: number
}

type KanbanProps = {
  columns: KanbanColumnConfig[]
  initialCards?: KanbanCardType[]
  onCardsChange?: (cards: KanbanCardType[]) => void
  className?: string
  showDeleteZone?: boolean
  hierarchical?: boolean
  responsiveConfig?: Partial<ResponsiveKanbanConfig>
  onHierarchicalMove?: (params: {
    cardId: string
    newColumn: string
    newPosition: number
    newParentId?: string | null
    insertIndex: number
  }) => Promise<void>
  onValidateMove?: (params: { cardId: string; newParentId: string | null }) => {
    isValid: boolean
    reason?: string
  }
}

export function Kanban({
  columns,
  initialCards = [],
  onCardsChange,
  className,
  showDeleteZone = true,
  hierarchical = false,
  onHierarchicalMove,
  onValidateMove
}: KanbanProps) {
  return (
    <div className={cn("h-full w-full", className)}>
      <KanbanBoard
        columns={columns}
        initialCards={initialCards}
        onCardsChange={onCardsChange}
        showDeleteZone={showDeleteZone}
        hierarchical={hierarchical}
        onHierarchicalMove={onHierarchicalMove}
        onValidateMove={onValidateMove}
      />
    </div>
  )
}

type KanbanBoardProps = {
  columns: KanbanColumnConfig[]
  initialCards: KanbanCardType[]
  onCardsChange?: (cards: KanbanCardType[]) => void
  showDeleteZone: boolean
  hierarchical?: boolean
  onHierarchicalMove?: (params: {
    cardId: string
    newColumn: string
    newPosition: number
    newParentId?: string | null
    insertIndex: number
  }) => Promise<void>
  onValidateMove?: (params: { cardId: string; newParentId: string | null }) => {
    isValid: boolean
    reason?: string
  }
}

function KanbanBoard({
  columns,
  initialCards,
  onCardsChange,
  showDeleteZone,
  hierarchical = false,
  onHierarchicalMove,
  onValidateMove
}: KanbanBoardProps) {
  const [cards, setCards] = useState<KanbanCardType[]>(initialCards)
  const boardRef = useRef<HTMLDivElement>(null)
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragEvent, setDragEvent] = useState<DragEvent | null>(null)

  useEffect(() => {
    setCards(initialCards)
  }, [initialCards])

  useEffect(() => {
    onCardsChange?.(cards)
  }, [cards, onCardsChange])

  const handleAutoScroll = useCallback(() => {
    if (!dragEvent || !isDragging) return

    let scrollContainer: Element | null = null
    let element: Element | null = boardRef.current

    while (element && element !== document.body) {
      const computedStyle = window.getComputedStyle(element)
      const overflowY = computedStyle.overflowY
      const overflowX = computedStyle.overflowX

      if (
        overflowY === "auto" ||
        overflowY === "scroll" ||
        overflowX === "auto" ||
        overflowX === "scroll"
      ) {
        scrollContainer = element
        break
      }
      element = element.parentElement
    }

    if (!scrollContainer) scrollContainer = document.documentElement

    const rect = scrollContainer.getBoundingClientRect()
    const scrollThreshold = 100
    const scrollSpeed = 15

    if (dragEvent.clientY < rect.top + scrollThreshold) {
      scrollContainer.scrollBy(0, -scrollSpeed)
    } else if (dragEvent.clientY > rect.bottom - scrollThreshold) {
      scrollContainer.scrollBy(0, scrollSpeed)
    }

    if (dragEvent.clientX < rect.left + scrollThreshold) {
      scrollContainer.scrollBy(-scrollSpeed, 0)
    } else if (dragEvent.clientX > rect.right - scrollThreshold) {
      scrollContainer.scrollBy(scrollSpeed, 0)
    }
  }, [dragEvent, isDragging])

  const startAutoScroll = useCallback(
    (e: DragEvent) => {
      setIsDragging(true)
      setDragEvent(e)

      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current)
      }

      autoScrollRef.current = setInterval(() => {
        handleAutoScroll()
      }, 16)
    },
    [handleAutoScroll]
  )

  const updateDragEvent = useCallback(
    (e: DragEvent) => {
      if (isDragging) {
        setDragEvent(e)
      }
    },
    [isDragging]
  )

  const stopAutoScroll = useCallback(() => {
    setIsDragging(false)
    setDragEvent(null)
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current)
      autoScrollRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={boardRef}
      className="grid h-full w-full grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3"
    >
      {columns.map((columnConfig) => (
        <KanbanColumn
          key={columnConfig.id}
          config={columnConfig}
          cards={cards}
          setCards={setCards}
          hierarchical={hierarchical}
          onHierarchicalMove={onHierarchicalMove}
          onValidateMove={onValidateMove}
          startAutoScroll={startAutoScroll}
          updateDragEvent={updateDragEvent}
          stopAutoScroll={stopAutoScroll}
          isDragging={isDragging}
        />
      ))}
      {showDeleteZone && (
        <div className="border-border flex items-start justify-center border-l p-3">
          <KanbanBurnBarrel setCards={setCards} />
        </div>
      )}
    </div>
  )
}

type KanbanColumnProps = {
  config: KanbanColumnConfig
  cards: KanbanCardType[]
  setCards: Dispatch<SetStateAction<KanbanCardType[]>>
  hierarchical?: boolean
  onHierarchicalMove?: (params: {
    cardId: string
    newColumn: string
    newPosition: number
    newParentId?: string | null
    insertIndex: number
  }) => Promise<void>
  onValidateMove?: (params: { cardId: string; newParentId: string | null }) => {
    isValid: boolean
    reason?: string
  }
  startAutoScroll: (e: DragEvent) => void
  updateDragEvent: (e: DragEvent) => void
  stopAutoScroll: () => void
  isDragging: boolean
}

function KanbanColumn({
  config,
  cards,
  setCards,
  hierarchical = false,
  onHierarchicalMove,
  onValidateMove,
  startAutoScroll,
  updateDragEvent,
  stopAutoScroll,
  isDragging
}: KanbanColumnProps) {
  const [active, setActive] = useState(false)

  function handleDragStart(e: DragEvent, card: KanbanCardType) {
    e.dataTransfer.setData("cardId", card.id)

    if (hierarchical) {
      const hierarchicalCard = card as HierarchicalKanbanCardType
      e.dataTransfer.setData("originalColumn", card.column)
      e.dataTransfer.setData("parentPath", JSON.stringify(hierarchicalCard.parentPath || []))
      e.dataTransfer.setData("hasChildren", String(hierarchicalCard.hasChildren || false))
    }

    startAutoScroll(e)
  }

  async function handleDragEnd(e: DragEvent) {
    const cardId = e.dataTransfer.getData("cardId")

    setActive(false)
    clearHighlights()
    stopAutoScroll()

    const indicators = getIndicators()
    const { element } = getNearestIndicator(e, indicators)

    const before = element.dataset.before || "-1"

    if (before !== cardId) {
      if (hierarchical && onHierarchicalMove) {
        try {
          const moveToBack = before === "-1"
          const columnCards = cards.filter((c) => c.column === config.id)
          let insertIndex = 0

          if (!moveToBack) {
            insertIndex = columnCards.findIndex((el) => el.id === before)
            if (insertIndex === -1) insertIndex = columnCards.length
          } else {
            insertIndex = columnCards.length
          }

          const draggedCard = cards.find((c) => c.id === cardId)
          const newParentId = draggedCard?.parentTaskId || null

          if (onValidateMove) {
            const validation = onValidateMove({ cardId, newParentId })
            if (!validation.isValid) {
              return
            }
          }

          await onHierarchicalMove({
            cardId,
            newColumn: config.id,
            newPosition: insertIndex,
            newParentId,
            insertIndex
          })
        } catch (error) {
          console.log(error)
        }
      } else {
        let copy = [...cards]
        let cardToTransfer = copy.find((c) => c.id === cardId)
        if (!cardToTransfer) return

        cardToTransfer = { ...cardToTransfer, column: config.id }
        copy = copy.filter((c) => c.id !== cardId)

        const moveToBack = before === "-1"
        if (moveToBack) {
          copy.push(cardToTransfer)
        } else {
          const insertAtIndex = copy.findIndex((el) => el.id === before)
          if (insertAtIndex === -1) return
          copy.splice(insertAtIndex, 0, cardToTransfer)
        }

        setCards(copy)
      }
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    updateDragEvent(e)
    highlightIndicator(e)
    setActive(true)
  }

  function clearHighlights(els?: HTMLElement[]) {
    const indicators = els || getIndicators()
    indicators.forEach((i) => {
      i.style.opacity = "0"
    })
  }

  function highlightIndicator(e: DragEvent) {
    const indicators = getIndicators()
    clearHighlights(indicators)
    const el = getNearestIndicator(e, indicators)
    el.element.style.opacity = "1"
  }

  function getNearestIndicator(e: DragEvent, indicators: HTMLElement[]) {
    const DISTANCE_OFFSET = 50

    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect()
        const offset = e.clientY - (box.top + DISTANCE_OFFSET)

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child }
        } else {
          return closest
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1]
      }
    )

    return el
  }

  function getIndicators() {
    return Array.from(
      document.querySelectorAll(`[data-column="${config.id}"]`) as unknown as HTMLElement[]
    )
  }

  function handleDragLeave() {
    clearHighlights()
    setActive(false)
  }

  const filteredCards = cards.filter((c) => c.column === config.id)
  const isAtLimit = config.maxCards && filteredCards.length >= config.maxCards

  return (
    <div className="border-border bg-sidebar flex h-full min-w-0 flex-col rounded-md border">
      <div className="border-border shrink-0 rounded-t-md border-b p-3">
        <div className="flex items-center justify-between">
          <h3
            className={cn(
              "truncate text-base font-semibold md:text-lg",
              config.color || "text-foreground"
            )}
          >
            {config.title}
          </h3>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-1 text-xs",
                isAtLimit
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {filteredCards.length}
              {config.maxCards && ` / ${config.maxCards}`}
            </span>
          </div>
        </div>
      </div>
      <div className="min-h-0 flex-1 p-3">
        <div
          onDrop={isAtLimit ? undefined : handleDragEnd}
          onDragOver={isAtLimit ? undefined : handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "min-h-full w-full transition-colors",
            isAtLimit
              ? "cursor-not-allowed"
              : active
                ? "bg-primary/5 rounded-lg"
                : "bg-transparent",
            isDragging && active && "ring-primary/20 ring-2"
          )}
          role="region"
          aria-label={`${config.title} column with ${filteredCards.length} tasks${config.maxCards ? ` (max ${config.maxCards})` : ""}${isAtLimit ? " - at capacity" : ""}`}
          aria-live="polite"
        >
          {filteredCards.map((c) => {
            const hierarchicalCard = c as HierarchicalKanbanCardType
            return (
              <KanbanCard
                key={c.id}
                {...c}
                handleDragStart={handleDragStart}
                depth={hierarchicalCard.depth}
                isExpanded={hierarchicalCard.isExpanded}
                hasChildren={hierarchicalCard.hasChildren}
                onToggleExpansion={hierarchicalCard.onToggleExpansion}
                onFocusParent={hierarchicalCard.onFocusParent}
              />
            )
          })}
          <KanbanDropIndicator beforeId={null} column={config.id} />
        </div>
      </div>
    </div>
  )
}

type KanbanCardProps = KanbanCardType & {
  handleDragStart: (e: DragEvent, card: KanbanCardType) => void
  depth?: number
  isExpanded?: boolean
  hasChildren?: boolean
  parentPath?: string[]
  onToggleExpansion?: (cardId: string) => void
  onFocusParent?: (parentId: string) => void
}

function KanbanCard({
  title,
  id,
  column,
  description,
  priority,
  assignee,
  parentTaskId,
  parentTaskTitle,
  handleDragStart,
  depth = 0,
  isExpanded = false,
  hasChildren = false,
  onToggleExpansion,
  onFocusParent
}: KanbanCardProps) {
  const priorityColors: Record<KanbanPriority, string> = {
    none: "bg-muted text-muted-foreground border border-muted",
    low: "bg-success text-success-foreground border border-success",
    medium: "bg-info text-info-foreground border border-info",
    high: "bg-warning text-warning-foreground border border-warning",
    urgent: "bg-error text-error-foreground border border-error"
  }

  const borderColors: Record<KanbanPriority, string> = {
    none: "border-l-muted",
    low: "border-l-success",
    medium: "border-l-info",
    high: "border-l-warning",
    urgent: "border-l-error"
  }

  const handleExpansionToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onToggleExpansion) {
      onToggleExpansion(id)
    }
  }

  const indentLevel = Math.min(depth, 5)
  const indentPx = indentLevel * 16

  return (
    <>
      <KanbanDropIndicator beforeId={id} column={column} />
      <motion.div
        layout
        className="flex items-center justify-start gap-3"
        layoutId={id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileDrag={{
          scale: 1.05,
          rotate: 2,
          zIndex: 1000
        }}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
        style={{ marginLeft: `${indentPx}px` }}
      >
        {depth > 0 && <Icon name="Link2" />}
        <Card
          draggable="true"
          onDragStart={(e) =>
            handleDragStart(e, {
              title,
              id,
              column,
              description,
              priority,
              assignee,
              parentTaskId,
              parentTaskTitle
            })
          }
          className={cn(
            "focus:ring-primary mb-2 w-full cursor-grab touch-manipulation gap-3 border-l-4 transition-all focus:ring-1 focus:outline-none active:cursor-grabbing",
            priority ? borderColors[priority] : borderColors.none,
            hasChildren && "border-r-primary border-r-4"
          )}
          tabIndex={0}
          role="button"
          aria-label={`Task: ${title}. ${description ? `Description: ${description}. ` : ""}${priority && priority !== "none" ? `Priority: ${priority}. ` : ""}Draggable. Press Enter or Space to interact.`}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
            }
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault()
            }
          }}
        >
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                {hasChildren && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleExpansionToggle}
                    className="hover:bg-muted h-6 w-6 flex-shrink-0 rounded p-1 transition-colors"
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                  >
                    {isExpanded ? <Icon name="ChevronDown" /> : <Icon name="ChevronRight" />}
                  </Button>
                )}
                <Typography
                  variant="h6"
                  className="truncate text-sm leading-tight font-medium text-balance"
                >
                  {title}
                </Typography>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                {parentTaskId && parentTaskTitle && (
                  <Badge
                    variant="secondary"
                    onClick={onFocusParent ? () => onFocusParent(parentTaskId) : undefined}
                    className="hover:bg-secondary/80 cursor-pointer transition-colors"
                  >
                    <Icon name="Link" className="mr-1 h-3 w-3" />
                    <Typography variant="span" affects="small">
                      {parentTaskTitle}
                    </Typography>
                  </Badge>
                )}
                {depth > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <Typography variant="span" affects="small">
                      L {depth}
                    </Typography>
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {description && (
              <Typography
                variant="p"
                affects={["muted", "removePMargin"]}
                className="line-clamp-2 text-xs leading-relaxed break-words"
              >
                {description}
              </Typography>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {priority && priority !== "none" && (
                  <Typography
                    variant="span"
                    affects="small"
                    className={cn(
                      "rounded-full px-2.5 py-1 font-medium whitespace-nowrap",
                      priorityColors[priority]
                    )}
                  >
                    {priority}
                  </Typography>
                )}
              </div>
              {assignee && (
                <div className="bg-primary text-primary-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full shadow-sm">
                  <Typography variant="span" affects="small" className="font-semibold">
                    {assignee.charAt(0).toUpperCase()}
                  </Typography>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  )
}

type KanbanDropIndicatorProps = {
  beforeId: string | null
  column: string
}

function KanbanDropIndicator({ beforeId, column }: KanbanDropIndicatorProps) {
  return (
    <motion.div
      data-before={beforeId || "-1"}
      data-column={column}
      className="bg-primary my-0.5 h-0.5 w-full rounded-full opacity-0"
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 0, scaleX: 1 }}
      style={{ transformOrigin: "center" }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    />
  )
}

type KanbanBurnBarrelProps = {
  setCards: Dispatch<SetStateAction<KanbanCardType[]>>
}

function KanbanBurnBarrel({ setCards }: KanbanBurnBarrelProps) {
  const [active, setActive] = useState(false)

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    setActive(true)
  }

  function handleDragLeave() {
    setActive(false)
  }

  function handleDragEnd(e: DragEvent) {
    const cardId = e.dataTransfer.getData("cardId")
    setCards((pv: KanbanCardType[]) => pv.filter((c) => c.id !== cardId))
    setActive(false)
  }

  return (
    <motion.div
      onDrop={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "grid h-32 w-32 shrink-0 place-content-center rounded-lg border-2 border-dashed text-2xl transition-colors md:h-40 md:w-40 md:text-3xl",
        active
          ? "border-destructive bg-destructive/10 text-destructive"
          : "border-muted-foreground/25 bg-muted/20 text-muted-foreground"
      )}
      animate={{
        scale: active ? 1.05 : 1,
        borderWidth: active ? "3px" : "2px"
      }}
      transition={{ duration: 0.2 }}
      role="region"
      aria-label="Delete zone - drop tasks here to delete them"
      aria-live="polite"
    >
      <motion.div
        animate={{
          rotate: active ? [0, -10, 10, -10, 0] : 0,
          scale: active ? 1.1 : 1
        }}
        transition={{
          rotate: { duration: 0.5, repeat: active ? Infinity : 0 },
          scale: { duration: 0.2 }
        }}
      >
        {active ? <Icon name="Flame" /> : <Icon name="Trash" />}
      </motion.div>
    </motion.div>
  )
}
