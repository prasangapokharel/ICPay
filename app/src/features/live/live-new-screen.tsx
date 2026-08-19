import { useState } from 'react'
import { View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { useAuth } from '@/components/auth/auth-provider'
import { useOwnProfile } from '@/hooks/use-wallet-data'
import { canCreateLiveRoom } from '@/lib/live-access'
import { createLiveRoom, type LiveVisibility } from '@/services/live/live'

export function LiveNewScreen() {
  const t = useTranslations('live')
  const { identity } = useAuth()
  const { data: profile } = useOwnProfile()
  const canCreate = canCreateLiveRoom(profile?.username[0])
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [visibility, setVisibility] = useState<'open' | 'inviteOnly'>('open')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    if (!identity || busy) return
    setBusy(true)
    setError(null)
    try {
      const vis: LiveVisibility = visibility === 'open' ? { open: null } : { inviteOnly: null }
      const result = await createLiveRoom(identity, title.trim(), vis)
      router.replace(`/live/${result.roomId}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <View className="gap-6 pt-2">
      <View>
        <Text className="text-xl font-bold">{t('newRoom')}</Text>
        <Text className="text-sm text-muted-foreground">{t('newRoomHint')}</Text>
      </View>
      {!canCreate ? (
        <Alert>
          <AlertDescription>
            {t('createLockedBody')}
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Input value={title} onChangeText={setTitle} placeholder={t('roomTitlePlaceholder')} size="lg" maxLength={80} />
          <View className="flex-row gap-3">
            <Button className="flex-1" size="lg" variant={visibility === 'open' ? 'default' : 'outline'} onPress={() => setVisibility('open')}>
              {t('public')}
            </Button>
            <Button
              className="flex-1"
              size="lg"
              variant={visibility === 'inviteOnly' ? 'default' : 'outline'}
              onPress={() => setVisibility('inviteOnly')}
            >
              {t('private')}
            </Button>
          </View>
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <Button size="xl" disabled={!title.trim() || busy} onPress={() => void submit()}>
            {busy ? t('creating') : t('createRoom')}
          </Button>
        </>
      )}
    </View>
  )
}
