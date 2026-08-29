import { useState } from 'react'
import { View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { useAuth } from '@/components/auth/auth-provider'
import { useInvalidateCommunityLists } from '@/hooks/use-community'
import { parseCommunityPriceIcp } from '@/lib/community/format'
import { createCommunityChannel } from '@/services/community/community'

export function ChannelCreateScreen() {
  const t = useTranslations('community')
  const router = useRouter()
  const { identity } = useAuth()
  const invalidate = useInvalidateCommunityLists()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [bio, setBio] = useState('')
  const [price, setPrice] = useState('')
  const [paid, setPaid] = useState(false)
  const [privateChannel, setPrivateChannel] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    const cleanSlug = slug.trim().toLowerCase()
    if (!name.trim() || cleanSlug.length < 3) {
      setError(t('slugInvalid'))
      return
    }
    const priceE8s = paid ? parseCommunityPriceIcp(price) : 0n
    if (paid && priceE8s === null) {
      setError(t('priceInvalid', { min: '0.1', max: '10' }))
      return
    }
    setBusy(true)
    setError(null)
    try {
      await createCommunityChannel(
        identity,
        name.trim(),
        cleanSlug,
        bio.trim(),
        privateChannel ? { inviteOnly: null } : { open: null },
        paid ? { paid: null } : { free: null },
        priceE8s ?? 0n,
      )
      await invalidate()
      router.replace(`/channels/${cleanSlug}` as never)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('createFailed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <View className="gap-4 pt-2">
      <View>
        <Text className="text-xl font-bold">{t('createTitle')}</Text>
        <Text className="text-sm text-muted-foreground">{t('createSubtitle')}</Text>
      </View>
      <Input value={name} onChangeText={setName} placeholder={t('namePlaceholder')} />
      <Input
        value={slug}
        onChangeText={(v) => setSlug(v.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
        placeholder={t('slug')}
        autoCapitalize="none"
      />
      <Text className="text-xs text-muted-foreground">{t('slugHint')}</Text>
      <Input value={bio} onChangeText={setBio} placeholder={t('bioPlaceholder')} multiline />
      <View className="flex-row gap-2">
        <Button variant={privateChannel ? 'default' : 'outline'} className="flex-1" onPress={() => setPrivateChannel(true)}>
          {t('private')}
        </Button>
        <Button variant={!privateChannel ? 'default' : 'outline'} className="flex-1" onPress={() => setPrivateChannel(false)}>
          {t('public')}
        </Button>
      </View>
      <View className="flex-row gap-2">
        <Button variant={paid ? 'default' : 'outline'} className="flex-1" onPress={() => setPaid(true)}>
          {t('paid')}
        </Button>
        <Button variant={!paid ? 'default' : 'outline'} className="flex-1" onPress={() => setPaid(false)}>
          {t('free')}
        </Button>
      </View>
      {paid ? (
        <>
          <Input value={price} onChangeText={setPrice} placeholder={t('price')} keyboardType="decimal-pad" />
          <Text className="text-xs text-muted-foreground">{t('priceHint')}</Text>
        </>
      ) : null}
      {error ? <Text className="text-sm text-destructive">{error}</Text> : null}
      <Button disabled={busy} onPress={() => void submit()}>
        {busy ? t('creating') : t('create')}
      </Button>
    </View>
  )
}
