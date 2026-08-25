"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/components/auth/auth-provider"
import { useRewrittenLastSegment } from "@/lib/routing/rewrittenRoute"
import { joinCommunityChannel } from "@/services/community/community"

export function CommunityJoinScreen() {
  const slug = useRewrittenLastSegment()
  const searchParams = useSearchParams()
  const code = searchParams.get("code") ?? ""
  const t = useTranslations("community")
  const router = useRouter()
  const { identity } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const started = useRef(false)
  const busy = !error && !!code && !!identity && slug !== "slug" && !!slug

  useEffect(() => {
    if (!slug || slug === "slug" || !identity || !code || started.current) return
    started.current = true
    joinCommunityChannel(identity, slug, code)
      .then(() => {
        router.replace(`/channels/${encodeURIComponent(slug)}`)
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : t("joinFailed"))
      })
  }, [slug, identity, code, router, t])

  if (!slug || slug === "slug") return null

  return (
    <div className="flex h-full items-center justify-center p-6">
      <Card size="sm" className="max-w-sm border-muted/60 bg-card shadow-sm">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription className={error ? "text-destructive" : undefined}>
            {busy && !error
              ? t("joining")
              : error
                ? error
                : !code
                  ? t("inviteRequired")
                  : null}
          </CardDescription>
        </CardHeader>
        {busy && !error ? (
          <CardFooter className="justify-center">
            <Spinner className="size-6" />
          </CardFooter>
        ) : error ? (
          <CardFooter>
            <Button className="w-full" onClick={() => router.push(`/channels/${encodeURIComponent(slug)}`)}>
              {t("openChannel")}
            </Button>
          </CardFooter>
        ) : null}
      </Card>
    </div>
  )
}
