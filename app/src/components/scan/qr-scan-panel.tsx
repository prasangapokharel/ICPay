import { useState } from 'react'
import { View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { QrCamera } from '@/components/scan/qr-camera'
import { parseAddress, type ScannedAddress } from '@/lib/icp-address'

export function QrScanPanel({
  onScan,
}: {
  onScan: (hit: ScannedAddress, raw: string) => void
}) {
  const t = useTranslations('scan')
  const [error, setError] = useState<string | null>(null)
  const [paste, setPaste] = useState('')

  const apply = (raw: string) => {
    const hit = parseAddress(raw)
    if (!hit) {
      setError(t('notAddress'))
      return
    }
    setError(null)
    setPaste('')
    onScan(hit, raw)
  }

  return (
    <View>
      <QrCamera onRaw={apply} onError={setError} />
      <Text className="mt-3 text-xs text-muted-foreground">{t('description')}</Text>
      <Input
        value={paste}
        onChangeText={(value) => {
          setPaste(value)
          if (parseAddress(value)) apply(value)
        }}
        autoCapitalize="none"
        placeholder={t('title')}
        className="mt-2"
      />
      {error ? (
        <View className="mt-3">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </View>
      ) : null}
    </View>
  )
}
