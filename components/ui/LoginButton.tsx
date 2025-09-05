"use client"

import { signIn } from "@/lib/auth.client"

import { Button } from "@/components/ui"

function LoginButton() {
  const handleLogin = async () => {
    await signIn.social({ provider: "google", callbackURL: "/dashboard" })
  }

  return <Button onClick={handleLogin}>Login</Button>
}

export { LoginButton }
