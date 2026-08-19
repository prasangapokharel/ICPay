"use client"

import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { USERNAME_FREE_MIN_LENGTH } from "@/lib/profile/username"

// A username is required rather than suggested: without one, nobody can send
// this account ICP by name. So there is no dismiss path -- no close button, no
// outside click, no escape key.
export function UsernamePrompt({ username }: { username?: string }) {
  const t = useTranslations("username")
  if (username) return null

  return (
    <Dialog open disablePointerDismissal onOpenChange={() => {}}>
      <DialogContent showCloseButton={false}>
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
          <DialogTitle className="text-center">{t("promptTitle")}</DialogTitle>
          <DialogDescription className="text-center">
            {t("promptBody", { min: USERNAME_FREE_MIN_LENGTH })}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button className="w-full" nativeButton={false} render={<Link href="/profile" />}>
            {t("promptAction")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
