import { useState } from 'react'
import { Linking, Pressable, View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { useAuth } from '@/components/auth/auth-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { SocialBrandIcon } from '@/features/profile/social-brand-icon'
import { socialKey, toSocialPlatform, type SocialKey } from '@/lib/social-platform'
import { removeSocialLink, setSocialLink } from '@/services/sociallink/sociallink'
import type { UserPublic } from '@/services/types'

const PLATFORMS: SocialKey[] = ['github', 'linkedin', 'website']

export function SocialLinksEditor({
  user,
  onUpdate,
}: {
  user: UserPublic
  onUpdate: (updated: UserPublic) => void
}) {
  const t = useTranslations('socialLinks')
  const tc = useTranslations('common')
  const { identity } = useAuth()
  const [open, setOpen] = useState<SocialKey | null>(null)
  const [url, setUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const linkMap = new Map((user.socialLinks[0] ?? []).map((link) => [socialKey(link.platform), link.url]))

  const handleOpen = (key: SocialKey) => {
    setOpen(key)
    setUrl(linkMap.get(key) ?? '')
    setError(null)
    setSaved(false)
  }

  const handleSave = async () => {
    if (!open) return
    setSaving(true)
    setError(null)
    const result = await setSocialLink(identity, toSocialPlatform(open), url.trim())
    setSaving(false)
    if ('err' in result) {
      setError(result.err)
      return
    }
    onUpdate(result.ok)
    setSaved(true)
    setTimeout(() => {
      setOpen(null)
      setSaved(false)
    }, 800)
  }

  const handleRemove = async (key: SocialKey) => {
    const result = await removeSocialLink(identity, toSocialPlatform(key))
    if ('ok' in result) onUpdate(result.ok)
  }

  return (
    <View className="gap-3">
      <Text className="text-sm font-semibold">{t('title')}</Text>
      {PLATFORMS.map((key) => {
        const existing = linkMap.get(key)
        const isOpen = open === key
        return (
          <View key={key} className="rounded-2xl border border-border bg-muted/30 px-3 py-2.5">
            <View className="flex-row items-center gap-2.5">
              <SocialBrandIcon name={key} />
              <Text className="flex-1 text-sm font-medium">{t(key)}</Text>
              {existing && !isOpen ? (
                <View className="flex-row items-center gap-1">
                  <Pressable onPress={() => void Linking.openURL(existing)} className="max-w-28">
                    <Text numberOfLines={1} className="text-xs text-primary">
                      {existing.replace(/^https?:\/\//, '')}
                    </Text>
                  </Pressable>
                  <Button variant="ghost" size="sm" onPress={() => void handleRemove(key)}>
                    {t('removeBtn')}
                  </Button>
                </View>
              ) : !isOpen ? (
                <Button variant="ghost" size="sm" onPress={() => handleOpen(key)}>
                  {t('addBtn')}
                </Button>
              ) : null}
            </View>
            {isOpen ? (
              <View className="mt-2 gap-1.5">
                <Input
                  autoFocus
                  value={url}
                  onChangeText={(value) => {
                    setUrl(value)
                    setError(null)
                  }}
                  autoCapitalize="none"
                  placeholder={t(`urlPlaceholder.${key}`)}
                  className="text-xs"
                />
                {error ? (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}
                <View className="flex-row items-center gap-1.5">
                  <Button size="sm" disabled={saving || !url.trim()} onPress={() => void handleSave()}>
                    {saved ? t('saved') : t('saveBtn')}
                  </Button>
                  <Button variant="ghost" size="sm" onPress={() => setOpen(null)}>
                    {tc('cancel')}
                  </Button>
                </View>
              </View>
            ) : null}
          </View>
        )
      })}
    </View>
  )
}
