import { useState } from 'react'
import { View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet } from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { useAuth } from '@/components/auth/auth-provider'
import { normalizeLedgerId } from '@/lib/wallet/customTokens'
import { fetchTokenMetadata, type TokenMetadata } from '@/services/tokens'

export function AddTokenSheet({
  open,
  onOpenChange,
  existingIds,
  onAdded,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingIds: string[]
  onAdded: (ledgerId: string, meta: TokenMetadata) => void
}) {
  const t = useTranslations('wallet')
  const { identity } = useAuth()
  const [ledgerId, setLedgerId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const reset = () => {
    setLedgerId('')
    setError(null)
    setLoading(false)
  }

  const close = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const handleAdd = async () => {
    setError(null)
    const normalized = normalizeLedgerId(ledgerId)
    if (!normalized) {
      setError(t('addTokenInvalid'))
      return
    }
    if (existingIds.includes(normalized)) {
      setError(t('addTokenExists'))
      return
    }
    setLoading(true)
    try {
      const meta = await fetchTokenMetadata(normalized, identity)
      if (!meta) {
        setError(t('addTokenNotFound'))
        return
      }
      onAdded(normalized, meta)
      close(false)
    } catch {
      setError(t('addTokenNotFound'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={close} title={t('addTokenTitle')} description={t('addTokenHint')}>
      <View className="gap-4 pb-2">
        <View className="gap-2">
          <Text className="text-sm font-medium">{t('addTokenLabel')}</Text>
          <Input
            value={ledgerId}
            onChangeText={setLedgerId}
            placeholder={t('addTokenPlaceholder')}
            autoCapitalize="none"
            autoCorrect={false}
            className="font-mono text-xs"
          />
        </View>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <Button disabled={loading || !ledgerId.trim()} onPress={() => void handleAdd()}>
          {loading ? <Spinner /> : null}
          {t('addTokenAction')}
        </Button>
      </View>
    </Sheet>
  )
}
