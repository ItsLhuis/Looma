"use client"

import { PropsWithChildren, useState } from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

export function QueryProvider({ children }: PropsWithChildren) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30,
            gcTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
            retry: 1
          }
        }
      })
  )

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
