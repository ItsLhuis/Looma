"use client"

import { createContext, useContext, type ReactNode } from "react"

type User = {
  id: string
  name: string | null
  email: string | null
  image: string | null
}

const UserContext = createContext<User | null>(null)

export function UserProvider({ children, user }: { children: ReactNode; user: User }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

export function useUser() {
  const user = useContext(UserContext)
  if (!user) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return user
}
