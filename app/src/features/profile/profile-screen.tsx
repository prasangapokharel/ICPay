import { useState } from 'react'
import { View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { UserAvatar } from '@/components/ui/user-avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { PremiumBadge } from '@/components/shared/premium-badge'
import { useAuth } from '@/components/auth/auth-provider'
import { useOwnProfile, usePatchDashboardUser } from '@/hooks/use-wallet-data'
import { updateUsername } from '@/services/profile/profile'
import { copyText, shortPrincipal } from '@/lib/wallet-utils'
import { ShareProfileCard } from '@/features/profile/share-profile-card'
import { SocialLinksEditor } from '@/features/profile/social-links-editor'

export function ProfileScreen() {
  const t = useTranslations('profile')
  const tc = useTranslations('common')
  const { identity } = useAuth()
  const patchDashboardUser = usePatchDashboardUser()
  const principal = identity?.getPrincipal().toText() ?? ''
  const { data: user, mutate } = useOwnProfile()
  const [name, setName] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const claimed = user?.username?.[0]

  const save = async () => {
    const result = await updateUsername(identity, name.trim())
    if ('err' in result) {
      setError(result.err)
      return
    }
    mutate(result.ok, { revalidate: false })
    patchDashboardUser(result.ok)
    setName('')
  }

  if (!user) return null

  return (
    <View className="gap-6 pt-2">
      <View className="items-center">
        <UserAvatar seed={claimed ?? principal} size={80} />
        <View className="mt-3 flex-row items-center gap-1.5">
          <Text className="text-xl font-bold">{claimed ? `@${claimed}` : t('title')}</Text>
          {claimed ? <PremiumBadge name={claimed} /> : null}
        </View>
        <Button
          variant="ghost"
          size="sm"
          className="mt-1 active:opacity-70"
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
      {claimed ? <ShareProfileCard username={claimed} /> : null}
      <SocialLinksEditor user={user} onUpdate={(updated) => mutate(updated, { revalidate: false })} />
      {!claimed ? (
        <View className="gap-3">
          <Input value={name} onChangeText={setName} autoCapitalize="none" placeholder={t('username')} />
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <Button onPress={() => void save()}>{t('username')}</Button>
        </View>
      ) : null}
    </View>
  )
}
