"use client"

import { useEffect, useState, type Dispatch, type DragEvent, type SetStateAction } from "react"

import { cn } from "@/lib/utils"

import { Flame, Trash2 } from "lucide-react"

import { Card as UICard } from "@/components/ui/Card"

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
}

export function Kanban({
  columns,
  initialCards = [],
  onCardsChange,
  className,
  showDeleteZone = true
}: KanbanProps) {
  return (
    <div className={cn("bg-background text-foreground h-screen w-full", className)}>
      <KanbanBoard
        columns={columns}
        initialCards={initialCards}
        onCardsChange={onCardsChange}
        showDeleteZone={showDeleteZone}
      />
    </div>
  )
}

type KanbanBoardProps = {
  columns: KanbanColumnConfig[]
  initialCards: KanbanCardType[]
  onCardsChange?: (cards: KanbanCardType[]) => void
  showDeleteZone: boolean
}

function KanbanBoard({ columns, initialCards, onCardsChange, showDeleteZone }: KanbanBoardProps) {
  const [cards, setCards] = useState<KanbanCardType[]>(initialCards)

  useEffect(() => {
    setCards(initialCards)
  }, [initialCards])

  useEffect(() => {
    onCardsChange?.(cards)
  }, [cards, onCardsChange])

  return (
    <div className="flex h-full w-full gap-6 overflow-auto p-6">
      {columns.map((columnConfig) => (
        <KanbanColumn
          key={columnConfig.id}
          config={columnConfig}
          cards={cards}
          setCards={setCards}
        />
      ))}
      {showDeleteZone && <KanbanBurnBarrel setCards={setCards} />}
    </div>
  )
}

type KanbanColumnProps = {
  config: KanbanColumnConfig
  cards: KanbanCardType[]
  setCards: Dispatch<SetStateAction<KanbanCardType[]>>
}

function KanbanColumn({ config, cards, setCards }: KanbanColumnProps) {
  const [active, setActive] = useState(false)

  function handleDragStart(e: DragEvent, card: KanbanCardType) {
    e.dataTransfer.setData("cardId", card.id)
  }

  function handleDragEnd(e: DragEvent) {
    const cardId = e.dataTransfer.getData("cardId")

    setActive(false)
    clearHighlights()

    const indicators = getIndicators()
    const { element } = getNearestIndicator(e, indicators)

    const before = element.dataset.before || "-1"

    if (before !== cardId) {
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
        if (insertAtIndex === undefined) return

        copy.splice(insertAtIndex, 0, cardToTransfer)
      }

      setCards(copy)
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
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
    <div className="w-80 shrink-0">
      <div className="mb-4 flex items-center justify-between">
        <h3 className={cn("text-lg font-semibold", config.color || "text-foreground")}>
          {config.title}
        </h3>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2 py-1 text-xs",
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
      <div
        onDrop={isAtLimit ? undefined : handleDragEnd}
        onDragOver={isAtLimit ? undefined : handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "min-h-[200px] w-full rounded-lg border-2 border-dashed p-2 transition-colors",
          isAtLimit
            ? "border-destructive/50 bg-destructive/5 cursor-not-allowed"
            : active
              ? "border-primary bg-primary/5"
              : "border-muted bg-muted/20"
        )}
      >
        {filteredCards.map((c) => (
          <KanbanCard key={c.id} {...c} handleDragStart={handleDragStart} />
        ))}
        <KanbanDropIndicator beforeId={null} column={config.id} />
      </div>
    </div>
  )
}

type KanbanCardProps = KanbanCardType & {
  handleDragStart: (e: DragEvent, card: KanbanCardType) => void
}

function KanbanCard({
  title,
  id,
  column,
  description,
  priority,
  assignee,
  handleDragStart
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
    low: "border-l-green-500",
    medium: "border-l-blue-500",
    high: "border-l-yellow-500",
    urgent: "border-l-red-500"
  }

  return (
    <>
      <KanbanDropIndicator beforeId={id} column={column} />
      <motion.div layout layoutId={id}>
        <UICard
          draggable="true"
          onDragStart={(e) =>
            handleDragStart(e, { title, id, column, description, priority, assignee })
          }
          className={cn(
            "mb-3 cursor-grab border-l-4 p-4 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing",
            priority ? borderColors[priority] : borderColors.none
          )}
        >
          <div className="space-y-2">
            <h4 className="text-sm leading-tight font-medium">{title}</h4>
            {description && (
              <p className="text-muted-foreground line-clamp-2 text-xs">{description}</p>
            )}
            <div className="flex items-center justify-between">
              {priority && priority !== "none" && (
                <span
                  className={cn(
                    "rounded-full px-2 py-1 text-xs font-medium",
                    priorityColors[priority]
                  )}
                >
                  {priority}
                </span>
              )}
              {assignee && (
                <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium">
                  {assignee.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </UICard>
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
    <div
      data-before={beforeId || "-1"}
      data-column={column}
      className="bg-primary my-0.5 h-0.5 w-full opacity-0 transition-opacity"
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
    <div
      onDrop={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "mt-10 grid h-56 w-56 shrink-0 place-content-center rounded-lg border-2 border-dashed text-4xl transition-colors",
        active
          ? "border-destructive bg-destructive/10 text-destructive"
          : "border-muted-foreground/25 bg-muted/20 text-muted-foreground"
      )}
    >
      {active ? <Flame className="animate-bounce" /> : <Trash2 />}
    </div>
  )
}
