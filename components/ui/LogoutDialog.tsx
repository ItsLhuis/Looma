"use client"

import { useRouter } from "next/navigation"

import { signOut } from "@/lib/auth.client"

import { Button } from "@/components/ui/Button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/Dialog"
import { LoadingWrapper } from "@/components/ui/LoadingWrapper"

export type LogoutDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
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
        <Dialog
          open={open}
          onOpenChange={(value) => {
            if (isLoading) return
            onOpenChange(value)
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Log Out</DialogTitle>
              <DialogDescription>
                Are you sure you want to log out? You will be redirected to the home page.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleClick} isLoading={isLoading}>
                Log Out
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </LoadingWrapper>
  )
}

export { LogoutDialog }
