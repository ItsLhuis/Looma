"use client"

import { type CSSProperties, type ReactNode } from "react"

type AuroraTextProps = {
  children: ReactNode
  className?: string
  colors?: string[]
  speed?: number
}

function AuroraText({
  children,
  className = "",
  colors = ["#E2E2F7", "#AEAEDD", "#C6AEFF", "#B899FF", "#7E48FF", "#7033FF", "#323770"],
  speed = 1
}: AuroraTextProps) {
  const gradientStyle: CSSProperties = {
    backgroundImage: `linear-gradient(135deg, ${colors.join(", ")}, ${colors[0]})`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    animationDuration: `${10 / speed}s`
  }

  return (
    <span className={`relative inline-block ${className}`}>
      <span
        className="animate-aurora relative bg-[length:200%_auto] bg-clip-text text-transparent"
        style={gradientStyle}
        aria-hidden="true"
      >
        {children}
      </span>
    </span>
  )
}

export { AuroraText }
