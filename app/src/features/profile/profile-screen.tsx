import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { useRouter } from 'expo-router'
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
import { USERNAME_FREE_MIN_LENGTH, USERNAME_MAX_LENGTH } from '@/lib/username'
import { ShareProfileCard } from '@/features/profile/share-profile-card'
import { SocialLinksEditor } from '@/features/profile/social-links-editor'

export function ProfileScreen() {
  const t = useTranslations('profile')
  const tc = useTranslations('common')
  const router = useRouter()
  const { identity } = useAuth()
  const patchDashboardUser = usePatchDashboardUser()
  const principal = identity?.getPrincipal().toText() ?? ''
  const { data: user, mutate } = useOwnProfile()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const claimed = user?.username?.[0]

  const save = async () => {
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    const result = await updateUsername(identity, name.trim().toLowerCase())
    setSaving(false)
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
        <View className="gap-3 rounded-2xl border border-border/50 bg-muted/20 p-4">
          <Text className="text-sm font-semibold">{t('choose')}</Text>
          <Text className="text-xs text-muted-foreground">
            {t('freeRange', { min: USERNAME_FREE_MIN_LENGTH, max: USERNAME_MAX_LENGTH })}
          </Text>
          <Input
            value={name}
            onChangeText={(v) => {
              setName(v)
              setError(null)
            }}
            autoCapitalize="none"
            placeholder={t('username')}
          />
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <Button disabled={!name.trim() || saving} onPress={() => void save()}>
            {saving ? t('saving') : t('claim')}
          </Button>
          <Pressable
            onPress={() => router.push('/username')}
            className="items-center py-1 active:opacity-70"
          >
            <Text className="text-xs text-primary">{t('upsell')} →</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  )
}
