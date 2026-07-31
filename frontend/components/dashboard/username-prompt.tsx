"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const DISMISS_KEY = "icpay:username-prompt-dismissed"

// Only nudges users who have not claimed a username yet. Once one is set the
// prompt is permanently irrelevant, and "Later" is remembered so a user who
// declines is not asked again on every dashboard visit.
export function UsernamePrompt({ username }: { username?: string }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (username) return
    if (localStorage.getItem(DISMISS_KEY)) return
    setOpen(true)
  }, [username])

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1")
    setOpen(false)
  }

  if (username) return null

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : dismiss())}>
      <DialogContent>
        <DialogHeader>
          <div className="mb-3 flex justify-center">
            <span className="flex size-14 items-center justify-center overflow-hidden rounded-2xl bg-muted ring-1 ring-border">
              <Image
                src="/images/logo/logo.png"
                alt=""
                width={112}
                height={112}
                className="size-9 object-contain"
              />
            </span>
          </div>
          <DialogTitle className="text-center">Claim your username</DialogTitle>
          <DialogDescription className="text-center">
            Usernames are first come, first served. Claim yours before someone else
            does, and let people send you ICP without a long principal address.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            className="h-11 text-base"
            render={<Link href="/profile" onClick={dismiss} />}
          >
            Claim username
          </Button>
          <DialogClose render={<Button variant="ghost">Maybe later</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
