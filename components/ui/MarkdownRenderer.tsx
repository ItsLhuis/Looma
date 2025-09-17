"use client"

import { memo, useMemo, type ComponentPropsWithoutRef } from "react"

import { cn } from "@/lib/utils"

import { CodeBlock } from "@/components/ui/CodeBlock"
import { Typography } from "@/components/ui/Typography"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type MarkdownRendererProps = {
  content: string
  className?: string
}

type MarkdownComponentProps = {
  children?: React.ReactNode
  className?: string
  href?: string
  align?: "left" | "center" | "right" | "justify" | "char"
}

function MarkdownRendererComponent({ content, className }: MarkdownRendererProps) {
  const components = useMemo(
    () => ({
      code({
        className,
        children,
        ...props
      }: MarkdownComponentProps & ComponentPropsWithoutRef<"code">) {
        const inline = !className?.includes("language-")
        const match = /language-(\w+)/.exec(className || "")
        const language = match ? match[1] : ""

        if (!inline && language) {
          return <CodeBlock language={language}>{String(children).replace(/\n$/, "")}</CodeBlock>
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
      h1: ({ children }: MarkdownComponentProps) => (
        <Typography variant="h1">{children}</Typography>
      ),
      h2: ({ children }: MarkdownComponentProps) => (
        <Typography variant="h2">{children}</Typography>
      ),
      h3: ({ children }: MarkdownComponentProps) => (
        <Typography variant="h3">{children}</Typography>
      ),
      h4: ({ children }: MarkdownComponentProps) => (
        <Typography variant="h4">{children}</Typography>
      ),
      p: ({ children }: MarkdownComponentProps) => <Typography variant="p">{children}</Typography>,
      ul: ({ children }: MarkdownComponentProps) => (
        <ul className="my-6 ml-6 list-disc [&>li]:mt-2">{children}</ul>
      ),
      ol: ({ children }: MarkdownComponentProps) => (
        <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">{children}</ol>
      ),
      li: ({ children }: MarkdownComponentProps) => <li className="mt-2">{children}</li>,
      blockquote: ({ children }: MarkdownComponentProps) => (
        <Typography variant="blockquote">{children}</Typography>
      ),
      table: ({ children }: MarkdownComponentProps) => (
        <div className="my-6 w-full overflow-y-auto">
          <table className="w-full">{children}</table>
        </div>
      ),
      thead: ({ children }: MarkdownComponentProps) => (
        <thead className="[&_tr]:border-b">{children}</thead>
      ),
      tbody: ({ children }: MarkdownComponentProps) => (
        <tbody className="[&_tr:last-child]:border-0">{children}</tbody>
      ),
      tr: ({ children }: MarkdownComponentProps) => (
        <tr className="even:bg-muted/50 m-0 border-t p-0">{children}</tr>
      ),
      th: ({ children, align }: MarkdownComponentProps) => (
        <th
          className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right"
          align={align}
        >
          {children}
        </th>
      ),
      td: ({ children, align }: MarkdownComponentProps) => (
        <td
          className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"
          align={align}
        >
          {children}
        </td>
      ),
      a: ({ children, href }: MarkdownComponentProps) => (
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
      strong: ({ children }: MarkdownComponentProps) => (
        <Typography variant="span" affects={["bold"]}>
          {children}
        </Typography>
      ),
      em: ({ children }: MarkdownComponentProps) => (
        <Typography variant="span" affects={["italic"]}>
          {children}
        </Typography>
      )
    }),
    []
  )

  const remarkPlugins = useMemo(() => [remarkGfm], [])

  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}

export const MarkdownRenderer = memo(MarkdownRendererComponent)
