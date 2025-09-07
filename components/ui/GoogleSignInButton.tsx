"use client"

import { signIn } from "@/lib/auth.client"

import { Google } from "@/components/icons"

import { Button } from "@/components/ui/Button"
import { LoadingWrapper } from "@/components/ui/LoadingWrapper"
import { Typography } from "@/components/ui/Typography"

function GoogleSignInButton() {
  const handleSignIn = async () => {
    await signIn.social({ provider: "google", callbackURL: "/dashboard" })
  }

  return (
    <LoadingWrapper onClick={handleSignIn}>
      {({ isLoading, handleClick }) => (
        <Button
          variant="outline"
          size="xl"
          className="w-full"
          onClick={handleClick}
          isLoading={isLoading}
        >
          <Google />
          <Typography>Continue with Google</Typography>
        </Button>
      )}
    </LoadingWrapper>
  )
}

export { GoogleSignInButton }
