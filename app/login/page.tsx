"use client"

import { signIn } from "@/lib/auth.client"

import { Button } from "@/components/ui"

export default function LoginPage() {
  const loginGoogle = async () => {
    await signIn.social({ provider: "google", callbackURL: "/dashboard" })
  }

  return (
    <div className="min-h-dvh grid place-items-center">
      <Button onClick={loginGoogle}>Google</Button>
    </div>
  )
}
