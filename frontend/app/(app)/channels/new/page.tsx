"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { CommunityCreateForm } from "@/components/community/community-create-form"
import { useAuth } from "@/components/auth/auth-provider"
import { useOwnProfile } from "@/hooks/wallet/useWalletData"
import { useInvalidateCommunity } from "@/hooks/community/useCommunity"
import { createCommunityChannel } from "@/services/community/community"
import { isPremiumHandle } from "@/lib/verified/premiumTick"
import { PremiumLockedCard } from "@/components/shared/premium-gate"
import { Button } from "@/components/ui/button"
import { CommunityIcon } from "@/components/community/community-icon"

export default function NewChannelPage() {
  const t = useTranslations("community")
  const router = useRouter()
  const { identity } = useAuth()
  const { data: profile, isLoading: loadingProfile } = useOwnProfile()
  const invalidate = useInvalidateCommunity()

  const username = profile?.username[0] ?? null
  const isPremium = isPremiumHandle(username)

  if (!loadingProfile && !isPremium) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="z-20 flex shrink-0 items-center gap-2 border-b border-border/40 bg-background/95 px-3 py-2.5 backdrop-blur-md supports-[backdrop-filter]:bg-background/85 md:px-4">
          <Button
            variant="ghost"
            size="icon"
            nativeButton={false}
            render={<Link href="/channels" />}
            aria-label={t("backAria")}
            className="shrink-0"
          >
            <CommunityIcon name="back" size={18} />
          </Button>
          <h1 className="text-base font-semibold tracking-tight">{t("newChannel")}</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
          <div className="w-full max-w-lg">
            <PremiumLockedCard
              title="Premium Channel Broadcasting"
              description="Creating broadcast channels is exclusive to verified premium handles (1–4 characters). Upgrade your handle to broadcast news, announcements, and host paid channels across the ICPay network."
              actionText="Get Premium Handle"
              href="/username"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <CommunityCreateForm
        onCreate={async (payload) => {
          try {
            const result = await createCommunityChannel(
              identity,
              payload.name,
              payload.slug,
              payload.bio,
              payload.visibility,
              payload.access,
              payload.priceE8s
            )
            await invalidate()
            const code = result.inviteCode[0]
            if (code) {
              sessionStorage.setItem(`community-invite-${result.channelId}`, code)
            }
            router.push(`/channels/${encodeURIComponent(result.channelId)}`)
            return null
          } catch (e) {
            return e instanceof Error ? e.message : t("createFailed")
          }
        }}
      />
    </div>
  )
}
