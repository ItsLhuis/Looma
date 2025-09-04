"use client"

import { useRouter } from "next/navigation"

import { signOut } from "@/lib/auth.client"

import { Button } from "@/components/ui"

function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess() {
          router.push("/")
        }
      }
    })
  }

  return <Button onClick={handleLogout}>Logout</Button>
}

export { LogoutButton }
