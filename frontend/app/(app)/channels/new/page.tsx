"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { CommunityCreateForm } from "@/components/community/community-create-form"
import { useAuth } from "@/components/auth/auth-provider"
import { useInvalidateCommunity } from "@/hooks/community/useCommunity"
import { createCommunityChannel } from "@/services/community/community"

export default function NewChannelPage() {
  const t = useTranslations("community")
  const router = useRouter()
  const { identity } = useAuth()
  const invalidate = useInvalidateCommunity()

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
