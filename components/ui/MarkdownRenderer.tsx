"use client"

import { cn } from "@/lib/utils"

import { CodeBlock } from "@/components/ui/CodeBlock"
import { Typography } from "@/components/ui/Typography"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type MarkdownRendererProps = {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const inline = !className?.includes("language-")
            const match = /language-(\w+)/.exec(className || "")
            const language = match ? match[1] : ""

            if (!inline && language) {
              return (
                <CodeBlock language={language}>{String(children).replace(/\n$/, "")}</CodeBlock>
              )
            }

            return (
              <code
                className={cn(
                  "bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
                  className
                )}
                {...props}
              >
                {children}
              </code>
            )
          },
          h1: ({ children }) => <Typography variant="h1">{children}</Typography>,
          h2: ({ children }) => <Typography variant="h2">{children}</Typography>,
          h3: ({ children }) => <Typography variant="h3">{children}</Typography>,
          h4: ({ children }) => <Typography variant="h4">{children}</Typography>,
          p: ({ children }) => <Typography variant="p">{children}</Typography>,
          ul: ({ children }) => <ul className="my-6 ml-6 list-disc [&>li]:mt-2">{children}</ul>,
          ol: ({ children }) => <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">{children}</ol>,
          li: ({ children }) => <li className="mt-2">{children}</li>,
          blockquote: ({ children }) => <Typography variant="blockquote">{children}</Typography>,
          table: ({ children }) => (
            <div className="my-6 w-full overflow-y-auto">
              <table className="w-full">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="[&_tr]:border-b">{children}</thead>,
          tbody: ({ children }) => <tbody className="[&_tr:last-child]:border-0">{children}</tbody>,
          tr: ({ children }) => <tr className="even:bg-muted/50 m-0 border-t p-0">{children}</tr>,
          th: ({ children }) => (
            <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
              {children}
            </td>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-primary font-medium underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          hr: () => <hr className="my-4 md:my-8" />,
          strong: ({ children }) => (
            <Typography variant="span" affects={["bold"]}>
              {children}
            </Typography>
          ),
          em: ({ children }) => (
            <Typography variant="span" affects={["italic"]}>
              {children}
            </Typography>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
