"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"

import { useTheme } from "next-themes"

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism"

import { Button, Icon } from "@/components/ui"

type CodeBlockProps = {
  language: string
  children: string
  className?: string
}

export function CodeBlock({ language, children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const { resolvedTheme: theme } = useTheme()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isDark = theme === "dark"

  return (
    <div className={cn("group relative", className)}>
      <div className="bg-muted/50 text-muted-foreground flex items-center justify-between rounded-t-md px-4 py-2 text-xs">
        <span className="font-mono">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
        >
          {copied ? (
            <Icon name="Check" className="h-3 w-3" />
          ) : (
            <Icon name="Copy" className="h-3 w-3" />
          )}
        </Button>
      </div>
      <SyntaxHighlighter
        style={isDark ? oneDark : oneLight}
        language={language}
        PreTag="div"
        className="!mt-0 !rounded-t-none"
        showLineNumbers
        wrapLines
      >
        {children}
      </SyntaxHighlighter>
    </div>
  )
}
