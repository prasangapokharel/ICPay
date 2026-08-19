import { useState } from 'react'
import { Image } from 'expo-image'
import { View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { UserAvatar } from '@/components/ui/user-avatar'
import { Sheet } from '@/components/ui/sheet'
import { memoByteLength, MEMO_MAX_BYTES, parseIcp, E8S, ICP_FEE } from '@/lib/wallet-utils'
import { images } from '@/constants/images'
import { cn } from '@/lib/utils'
import { FiatAmount } from '@/components/shared/fiat-amount'
import { useIcpPrice } from '@/hooks/use-icp-price'

const PRESETS = [1n, 5n, 10n] as const

function tipPrefix(sender: string): string {
  return `Tip by @${sender}`
}

export function TipSheet({
  open,
  onOpenChange,
  username,
  senderUsername,
  balance,
  onTip,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  username: string
  senderUsername?: string
  balance?: bigint
  onTip: (amount: bigint, message?: string) => Promise<string | null>
}) {
  const t = useTranslations('tip')
  const tc = useTranslations('common')
  const [selected, setSelected] = useState<bigint | null>(E8S)
  const [custom, setCustom] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const amount = selected ?? parseIcp(custom)
  const total = amount === null ? null : amount + ICP_FEE
  const sendable = balance === undefined ? undefined : balance > ICP_FEE ? balance - ICP_FEE : 0n
  const insufficient = total !== null && balance !== undefined && total > balance
  const prefix = senderUsername ? tipPrefix(senderUsername) : ''
  const prefixBytes = prefix ? memoByteLength(`${prefix}: `) : 0
  const messageBudget = MEMO_MAX_BYTES - prefixBytes
  const memoTooLong = memoByteLength(message.trim()) > messageBudget
  const { price } = useIcpPrice()
  const usd = amount !== null && price ? (Number(amount) / Number(E8S)) * price.usd : null
  const canSend = amount !== null && amount > 0n && !insufficient && !memoTooLong && !loading

  const handleSend = async () => {
    if (amount === null) return
    setLoading(true)
    setError(null)
    const note = message.trim()
    const memo = prefix ? (note ? `${prefix}: ${note}` : prefix) : note || undefined
    const err = await onTip(amount, memo)
    setLoading(false)
    if (err) {
      setError(err)
      return
    }
    setMessage('')
    setCustom('')
    setSelected(E8S)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={`@${username}`} description={t('subtitle')}>
      <View className="mb-4 items-center">
        <UserAvatar seed={username} size={56} />
      </View>
      <View className="flex-row flex-wrap gap-2">
        {PRESETS.map((icp) => {
          const value = icp * E8S
          const tooBig = sendable !== undefined && value > sendable
          return (
            <Button
              key={icp.toString()}
              variant={selected === value ? 'default' : 'outline'}
              disabled={tooBig}
              className="h-14 flex-1"
              onPress={() => {
                setSelected(value)
                setError(null)
              }}
            >
              <Image source={images.logo} className="size-5" contentFit="contain" />
              <Text className={cn('text-base font-semibold', selected === value && 'text-primary-foreground')}>
                {icp.toString()}
              </Text>
            </Button>
          )
        })}
        <Button
          variant={selected === null ? 'default' : 'outline'}
          className="h-14 flex-1"
          onPress={() => {
            setSelected(null)
            setError(null)
          }}
        >
          <Text className={cn('text-xs font-semibold', selected === null && 'text-primary-foreground')}>{t('custom')}</Text>
        </Button>
      </View>
      {selected === null ? (
        <Input className="mt-3" value={custom} onChangeText={setCustom} keyboardType="decimal-pad" size="amount" />
      ) : null}
      <FiatAmount usd={usd} className="mt-3 text-center" />
      <View className="mt-4 flex-row items-baseline justify-between">
        <Text className="text-xs text-muted-foreground">{t('messageLabel')}</Text>
        <Text className={cn('text-xs', memoTooLong ? 'text-destructive' : 'text-muted-foreground')}>
          {memoByteLength(message.trim())}/{messageBudget}
        </Text>
      </View>
      <Input className="mt-2" value={message} onChangeText={setMessage} placeholder={t('messagePlaceholder')} multiline />
      {memoTooLong ? <Text className="mt-1 text-xs text-destructive">{t('memoTooLong', { max: messageBudget })}</Text> : null}
      {error ? (
        <Alert variant="destructive" className="mt-3">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Button className="mt-5 w-full" disabled={!canSend} onPress={() => void handleSend()}>
        {loading ? t('sending') : insufficient ? t('insufficient') : t('send')}
      </Button>
      <Button className="mt-2 w-full" variant="outline" disabled={loading} onPress={() => onOpenChange(false)}>
        {tc('cancel')}
      </Button>
    </Sheet>
  )
}
