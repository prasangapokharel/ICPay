import { useState } from 'react'
import { View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { UserAvatar } from '@/components/ui/user-avatar'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { PremiumBadge } from '@/components/shared/premium-badge'
import { SendSuccess } from '@/components/shared/send-success'
import { useAuth } from '@/components/auth/auth-provider'
import {
  useResolvedUsername,
  useRecipientProfile,
  useLiveBalance,
  useRefreshWallet,
  useOwnProfile,
} from '@/hooks/use-wallet-data'
import { tip } from '@/services/transfer/transfer'
import { copyText, shortPrincipal } from '@/lib/wallet-utils'
import { TipSheet } from '@/features/icpverse/tip-sheet'
import { AccountStatsCard } from '@/features/icpverse/account-stats-card'
import { SocialLinkIcons } from '@/features/icpverse/social-link-icons'
import { BookmarkButton } from '@/features/icpverse/bookmark-button'

type Tipped = { amount: bigint; blockIndex: bigint; memo?: string }

export function IcpverseProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>()
  const handle = (typeof username === 'string' ? username : '').trim().toLowerCase()
  const t = useTranslations('profileView')
  const tc = useTranslations('common')
  const { identity } = useAuth()
  const balance = useLiveBalance()
  const refreshWallet = useRefreshWallet()
  const { data: ownProfile } = useOwnProfile()
  const { principal, isLoading } = useResolvedUsername(handle)
  const recipientProfile = useRecipientProfile(handle, principal)
  const socialLinks = recipientProfile?.socialLinks?.[0] ?? []
  const [tipOpen, setTipOpen] = useState(false)
  const [tipped, setTipped] = useState<Tipped | null>(null)
  const [copied, setCopied] = useState(false)

  const handleTip = async (amount: bigint, message?: string): Promise<string | null> => {
    const result = await tip(identity, handle, amount, message)
    if ('err' in result) return result.err
    refreshWallet()
    setTipped({ amount, blockIndex: result.ok.blockIndex, memo: message })
    return null
  }

  if (isLoading || !handle) {
    return (
      <View className="items-center pt-12">
        <Skeleton className="size-24 rounded-full" />
        <Skeleton className="mt-4 h-6 w-32" />
      </View>
    )
  }

  if (!principal) {
    return (
      <View className="gap-4 pt-2">
        <Alert variant="destructive">
          <AlertDescription>{t('notFound', { name: handle })}</AlertDescription>
        </Alert>
      </View>
    )
  }

  if (tipped) {
    return (
      <SendSuccess
        amount={tipped.amount}
        recipient={`@${handle}`}
        blockIndex={tipped.blockIndex}
        memo={tipped.memo}
        kind="tip"
        onDone={() => setTipped(null)}
      />
    )
  }

  const isSelf = principal === identity?.getPrincipal().toText()

  return (
    <View className="items-center gap-6 pt-2">
      <View className="items-center">
        <UserAvatar seed={handle} size={108} />
        <View className="mt-4 flex-row items-center gap-1.5">
          <Text className="text-2xl font-bold">{handle}</Text>
          <PremiumBadge name={handle} />
        </View>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 active:opacity-70"
          onPress={async () => {
            await copyText(principal)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          }}
        >
          <Text className="font-mono text-xs text-muted-foreground">
            {copied ? tc('copied') : shortPrincipal(principal)}
          </Text>
        </Button>
      </View>

      {socialLinks.length > 0 ? (
        <View className="w-full items-center">
          <SocialLinkIcons links={socialLinks} />
        </View>
      ) : null}

      {!isSelf ? (
        <View className="w-full max-w-sm flex-row items-center gap-3">
          <Button className="min-w-0 flex-1" size="lg" onPress={() => setTipOpen(true)}>
            {t('tip')}
          </Button>
          {recipientProfile ? <BookmarkButton targetUserId={recipientProfile.id} username={handle} /> : null}
        </View>
      ) : null}

      <View className="w-full">
        <AccountStatsCard principal={principal} />
      </View>

      <TipSheet
        open={tipOpen}
        onOpenChange={setTipOpen}
        username={handle}
        senderUsername={ownProfile?.username?.[0]}
        balance={balance}
        onTip={handleTip}
      />
    </View>
  )
}
