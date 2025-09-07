"use client"

import { useState, type ReactNode } from "react"

type LoadingWrapperProps = {
  children: (props: { isLoading: boolean; handleClick: () => Promise<void> }) => ReactNode
  onClick: () => Promise<void>
}

function LoadingWrapper({ children, onClick }: LoadingWrapperProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    try {
      setIsLoading(true)
      await onClick()
    } finally {
      setIsLoading(false)
    }
  }

  return <>{children({ isLoading, handleClick })}</>
}

export { LoadingWrapper }
