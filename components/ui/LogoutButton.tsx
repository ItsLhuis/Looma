"use client"

import { useRouter } from "next/navigation"

import { signOut } from "@/lib/auth.client"

import { Button } from "@/components/ui/Button"
import { LoadingWrapper } from "@/components/ui/LoadingWrapper"

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

  return (
    <LoadingWrapper onClick={handleLogout}>
      {({ isLoading, handleClick }) => (
        <Button onClick={handleClick} isLoading={isLoading}>
          Logout
        </Button>
      )}
    </LoadingWrapper>
  )
}

export { LogoutButton }
