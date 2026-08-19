import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { Key01Icon } from '@hugeicons/core-free-icons'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AppIcon } from '@/components/ui/app-icon'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Sheet } from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { useBucketApiKeys } from '@/hooks/use-bucket-api-keys'
import { mapBucketError } from '@/lib/bucket/bucket'
import { copyText } from '@/lib/wallet-utils'
import type { ApiKeyCreateResult, ApiKeyPublic } from '@/services/bucket/types'

type ViewKind = 'list' | 'create' | 'secret'

function permLabel(
  key: ApiKeyPublic,
  t: (key: 'apiKeyPermRead' | 'apiKeyPermWrite' | 'apiKeyPermDelete' | 'apiKeyPermNone') => string,
) {
  const parts: string[] = []
  if (key.permissions.read) parts.push(t('apiKeyPermRead'))
  if (key.permissions.write) parts.push(t('apiKeyPermWrite'))
  if (key.permissions.delete) parts.push(t('apiKeyPermDelete'))
  return parts.join(' · ') || t('apiKeyPermNone')
}

export function BucketApiKeysSheet({
  bucketId,
  open,
  onOpenChange,
}: {
  bucketId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useTranslations('bucket')
  const tc = useTranslations('common')
  const { keys, isLoading, createKey, revokeKey, refresh } = useBucketApiKeys(bucketId, open)
  const [view, setView] = useState<ViewKind>('list')
  const [name, setName] = useState('')
  const [read, setRead] = useState(true)
  const [write, setWrite] = useState(true)
  const [del, setDel] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<ApiKeyCreateResult | null>(null)
  const [copied, setCopied] = useState(false)

  const resetForm = () => {
    setName('')
    setRead(true)
    setWrite(true)
    setDel(false)
    setError(null)
  }

  const close = (next: boolean) => {
    if (!next) {
      setView('list')
      setCreated(null)
      resetForm()
    }
    onOpenChange(next)
  }

  const handleCreate = async () => {
    setBusy(true)
    setError(null)
    const res = await createKey(name.trim(), { read, write, delete: del })
    setBusy(false)
    if ('err' in res) {
      setError(mapBucketError(res.err, (key) => t(key)))
      return
    }
    resetForm()
    setCreated(res.ok)
    setView('secret')
    await refresh()
  }

  const handleRevoke = async (keyId: string) => {
    setError(null)
    const res = await revokeKey(keyId)
    if ('err' in res) setError(mapBucketError(res.err, (key) => t(key)))
    else await refresh()
  }

  const title =
    view === 'create' ? t('apiKeyCreate') : view === 'secret' ? t('apiKeyCreatedTitle') : t('apiKeysTitle')
  const description =
    view === 'create' ? t('apiKeyCreateHint') : view === 'secret' ? t('apiKeyCreatedBody') : t('apiKeysHint')

  return (
    <Sheet open={open} onOpenChange={close} title={title} description={description}>
      {error && view !== 'secret' ? (
        <Alert variant="destructive" className="mb-3">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {view === 'create' ? (
        <>
          <Text className="mb-1.5 text-xs font-medium">{t('apiKeyName')}</Text>
          <Input value={name} onChangeText={setName} maxLength={32} placeholder={t('apiKeyNamePlaceholder')} />
          <Text className="mt-4 mb-2 text-xs font-medium">{t('apiKeyPermissions')}</Text>
          <PermToggle label={t('apiKeyPermRead')} value={read} onChange={setRead} />
          <PermToggle label={t('apiKeyPermWrite')} value={write} onChange={setWrite} />
          <PermToggle label={t('apiKeyPermDelete')} value={del} onChange={setDel} />
          <Button className="mt-5 w-full" disabled={busy || name.trim().length === 0} onPress={() => void handleCreate()}>
            {busy ? t('apiKeyCreating') : t('apiKeyCreate')}
          </Button>
          <Button className="mt-2 w-full" variant="outline" disabled={busy} onPress={() => setView('list')}>
            {tc('cancel')}
          </Button>
        </>
      ) : view === 'secret' ? (
        <>
          <View className="flex-row items-center gap-2 rounded-2xl border border-border px-3 py-2">
            <Text className="min-w-0 flex-1 font-mono text-xs" numberOfLines={1}>
              {created?.secret}
            </Text>
            <Button
              variant="outline"
              size="icon-sm"
              accessibilityLabel={copied ? tc('copied') : t('apiKeyCopySecret')}
              onPress={async () => {
                if (!created) return
                await copyText(created.secret)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
            >
              <AppIcon name={copied ? 'check' : 'copy'} size={16} />
            </Button>
          </View>
          <Button
            className="mt-5 w-full"
            onPress={() => {
              setCreated(null)
              setCopied(false)
              setView('list')
            }}
          >
            {tc('done')}
          </Button>
        </>
      ) : (
        <>
          {isLoading ? (
            <View className="items-center py-8">
              <Spinner />
            </View>
          ) : keys.length === 0 ? (
            <Text className="py-6 text-center text-xs text-muted-foreground">{t('apiKeysEmpty')}</Text>
          ) : (
            keys.map((key) => (
              <View key={key.id} className="flex-row items-center gap-2 border-b border-border py-2.5">
                <View className="min-w-0 flex-1">
                  <Text className="text-sm font-medium" numberOfLines={1}>
                    {key.name}
                  </Text>
                  <Text className="font-mono text-xs text-muted-foreground" numberOfLines={1}>
                    {key.keyHint}
                  </Text>
                  <Text className="text-xs text-muted-foreground">{permLabel(key, t)}</Text>
                </View>
                {key.revoked ? (
                  <Text className="text-xs text-muted-foreground">{t('apiKeyRevoked')}</Text>
                ) : (
                  <Button
                    variant="destructive"
                    size="icon-sm"
                    accessibilityLabel={t('apiKeyRevoke')}
                    onPress={() => void handleRevoke(key.id)}
                  >
                    <AppIcon name="delete" size={16} />
                  </Button>
                )}
              </View>
            ))
          )}
          <Button
            variant="outline"
            className="mt-4 w-full"
            onPress={() => {
              resetForm()
              setView('create')
            }}
          >
            <Icon icon={Key01Icon} size={16} />
            <Text className="text-sm">{t('apiKeyCreate')}</Text>
          </Button>
        </>
      )}
    </Sheet>
  )
}

function PermToggle({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <Pressable onPress={() => onChange(!value)} className="min-h-11 flex-row items-center gap-3">
      <View className={`size-5 items-center justify-center rounded border ${value ? 'border-primary bg-primary' : 'border-border'}`}>
        {value ? <Text className="text-[10px] text-primary-foreground">✓</Text> : null}
      </View>
      <Text className="text-sm">{label}</Text>
    </Pressable>
  )
}
