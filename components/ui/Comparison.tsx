"use client"

import { createContext, useContext, useState } from "react"

import { cn } from "@/lib/utils"

import {
  motion,
  type MotionValue,
  type SpringOptions,
  useMotionValue,
  useSpring,
  useTransform
} from "motion/react"

const ComparisonContext = createContext<
  | {
      sliderPosition: number
      setSliderPosition: (pos: number) => void
      motionSliderPosition: MotionValue<number>
    }
  | undefined
>(undefined)

type ComparisonProps = {
  children: React.ReactNode
  className?: string
  enableHover?: boolean
  springOptions?: SpringOptions
}

const DEFAULT_SPRING_OPTIONS = {
  bounce: 0,
  duration: 0
}

function Comparison({ children, className, enableHover, springOptions }: ComparisonProps) {
  const [isDragging, setIsDragging] = useState(false)
  const motionValue = useMotionValue(50)
  const motionSliderPosition = useSpring(motionValue, springOptions ?? DEFAULT_SPRING_OPTIONS)
  const [sliderPosition, setSliderPosition] = useState(50)

  const handleDrag = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging && !enableHover) return

    const containerRect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const x =
      "touches" in event
        ? event.touches[0].clientX - containerRect.left
        : (event as React.MouseEvent).clientX - containerRect.left

    const percentage = Math.min(Math.max((x / containerRect.width) * 100, 0), 100)
    motionValue.set(percentage)
    setSliderPosition(percentage)
  }

  return (
    <ComparisonContext.Provider value={{ sliderPosition, setSliderPosition, motionSliderPosition }}>
      <div
        className={cn(
          "relative overflow-hidden select-none",
          enableHover && "cursor-ew-resize",
          className
        )}
        onMouseMove={handleDrag}
        onMouseDown={() => !enableHover && setIsDragging(true)}
        onMouseUp={() => !enableHover && setIsDragging(false)}
        onMouseLeave={() => !enableHover && setIsDragging(false)}
        onTouchMove={handleDrag}
        onTouchStart={() => !enableHover && setIsDragging(true)}
        onTouchEnd={() => !enableHover && setIsDragging(false)}
      >
        {children}
      </div>
    </ComparisonContext.Provider>
  )
}

const ComparisonContent = ({
  className,
  children,
  position
}: {
  className?: string
  children: React.ReactNode
  position: "left" | "right"
}) => {
  const { motionSliderPosition } = useContext(ComparisonContext)!
  const leftClipPath = useTransform(motionSliderPosition, (value) => `inset(0 0 0 ${value}%)`)
  const rightClipPath = useTransform(
    motionSliderPosition,
    (value) => `inset(0 ${100 - value}% 0 0)`
  )

  return (
    <motion.div
      className={cn("absolute inset-0 h-full w-full", className)}
      style={{
        clipPath: position === "left" ? leftClipPath : rightClipPath
      }}
    >
      {children}
    </motion.div>
  )
}

const ComparisonSlider = ({
  className,
  children
}: {
  className?: string
  children?: React.ReactNode
}) => {
  const { motionSliderPosition } = useContext(ComparisonContext)!

  const left = useTransform(motionSliderPosition, (value) => `${value}%`)

  return (
    <motion.div
      className={cn("absolute top-0 bottom-0 w-1 cursor-ew-resize", className)}
      style={{
        left
      }}
    >
      {children}
    </motion.div>
  )
}

export { Comparison, ComparisonContent, ComparisonSlider }
