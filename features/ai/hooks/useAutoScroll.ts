import { useCallback, useEffect, useRef, useState } from "react"

interface UseAutoScrollOptions {
  threshold?: number
  behavior?: ScrollBehavior
  enabled?: boolean
}

interface UseAutoScrollReturn {
  scrollRef: React.RefObject<HTMLDivElement | null>
  scrollToBottom: () => void
  scrollToBottomIfNeeded: () => void
  setShouldAutoScroll: (should: boolean) => void
  isAtBottom: boolean
  shouldAutoScroll: boolean
}

export const useAutoScroll = ({
  threshold = 100,
  behavior = "smooth",
  enabled = true
}: UseAutoScrollOptions = {}): UseAutoScrollReturn => {
  const scrollRef = useRef<HTMLDivElement>(null)

  const [isAtBottom, setIsAtBottom] = useState(true)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)

  const checkIfAtBottom = useCallback(() => {
    if (!scrollRef.current) return false

    const scrollElement = scrollRef.current.querySelector(
      '[data-slot="scroll-area-viewport"]'
    ) as HTMLElement
    if (!scrollElement) return false

    const { scrollTop, scrollHeight, clientHeight } = scrollElement
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight

    return distanceFromBottom <= threshold
  }, [threshold])

  const scrollToBottom = useCallback(() => {
    if (!scrollRef.current || !enabled) return

    const scrollElement = scrollRef.current.querySelector(
      '[data-slot="scroll-area-viewport"]'
    ) as HTMLElement
    if (!scrollElement) return

    scrollElement.scrollTo({
      top: scrollElement.scrollHeight,
      behavior
    })
  }, [behavior, enabled])

  const scrollToBottomIfNeeded = useCallback(() => {
    if (shouldAutoScroll && isAtBottom) {
      setTimeout(() => {
        scrollToBottom()
      }, 50)
    }
  }, [shouldAutoScroll, isAtBottom, scrollToBottom])

  const handleScroll = useCallback(() => {
    const atBottom = checkIfAtBottom()
    setIsAtBottom(atBottom)

    if (!atBottom) {
      setShouldAutoScroll(false)
    }
  }, [checkIfAtBottom])

  useEffect(() => {
    if (!scrollRef.current || !enabled) return

    const scrollElement = scrollRef.current.querySelector(
      '[data-slot="scroll-area-viewport"]'
    ) as HTMLElement
    if (!scrollElement) return

    scrollElement.addEventListener("scroll", handleScroll, { passive: true })

    setIsAtBottom(checkIfAtBottom())

    return () => {
      scrollElement.removeEventListener("scroll", handleScroll)
    }
  }, [handleScroll, checkIfAtBottom, enabled])

  return {
    scrollRef,
    scrollToBottom,
    scrollToBottomIfNeeded,
    setShouldAutoScroll,
    isAtBottom,
    shouldAutoScroll
  }
}
