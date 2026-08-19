import { useState } from 'react'
import { View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslations } from '@/components/i18n/locale-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AppIcon } from '@/components/ui/app-icon'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { useAuth } from '@/components/auth/auth-provider'
import { LaunchRow } from '@/features/launch/launch-field'
import { LaunchFormFields, SOCIAL_FIELDS, type Socials } from '@/features/launch/launch-form-fields'
import { useDebounced } from '@/hooks/use-debounced'
import { useLaunchFee, useLaunchReady, useMyTokens, useSymbolAvailability } from '@/hooks/use-launch-data'
import { useLiveBalance, useRefreshWallet } from '@/hooks/use-wallet-data'
import { launchToken } from '@/services/launch/launch'
import {
  normalizeSymbol,
  parseSupply,
  validateDescription,
  validateLink,
  validateName,
  validateSupply,
  validateSymbol,
} from '@/lib/launch'
import { formatAmount, ICP_FEE } from '@/lib/wallet-utils'

export function LaunchCreateScreen() {
  const t = useTranslations('launch')
  const tc = useTranslations('common')
  const router = useRouter()
  const { identity } = useAuth()
  const refreshWallet = useRefreshWallet()
  const { refresh } = useMyTokens()
  const { fee } = useLaunchFee()
  const { ready } = useLaunchReady()
  const balance = useLiveBalance()
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [description, setDescription] = useState('')
  const [supply, setSupply] = useState('')
  const [logo, setLogo] = useState<string | null>(null)
  const [socials, setSocials] = useState<Socials>({ website: '', telegram: '', twitter: '' })
  const [socialsOpen, setSocialsOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [launching, setLaunching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const nameErr = name ? validateName(name) : null
  const symbolErr = symbol ? validateSymbol(symbol) : null
  const descErr = validateDescription(description)
  const supplyErr = supply ? validateSupply(supply) : null
  const socialErrs = SOCIAL_FIELDS.map((field) => validateLink(socials[field.key]))
  const debouncedSymbol = useDebounced(symbolErr ? '' : symbol)
  const { available, isLoading: checking } = useSymbolAvailability(debouncedSymbol)
  const symbolSettled =
    !symbolErr && symbol !== '' && normalizeSymbol(debouncedSymbol) === normalizeSymbol(symbol)
  const launchFee = fee?.total
  const total = launchFee === undefined ? undefined : launchFee + ICP_FEE
  const insufficient = total !== undefined && balance !== undefined && total > balance
  const complete =
    name.trim() !== '' &&
    symbol !== '' &&
    description.trim() !== '' &&
    supply !== '' &&
    !nameErr &&
    !symbolErr &&
    !descErr &&
    !supplyErr &&
    socialErrs.every((err) => err === null)
  const canReview = complete && symbolSettled && available === true && !insufficient && ready !== false

  const submit = async () => {
    const totalSupply = parseSupply(supply)
    if (!totalSupply) return
    setLaunching(true)
    setError(null)
    const result = await launchToken(identity, {
      name,
      symbol,
      description,
      logo: logo ?? undefined,
      website: socials.website || undefined,
      telegram: socials.telegram || undefined,
      twitter: socials.twitter || undefined,
      totalSupply,
      immutable: true,
    })
    setLaunching(false)
    if ('err' in result) {
      setError(result.err)
      setConfirmOpen(false)
      return
    }
    refreshWallet()
    await refresh()
    router.replace(`/launch/${result.ok.id}`)
  }

  return (
    <View className="gap-4 pt-2">
      <View>
        <Text className="text-xl font-bold">{t('formTitle')}</Text>
        <Text className="text-sm text-muted-foreground">{t('formSubtitle')}</Text>
      </View>

      {ready === false ? (
        <Alert variant="destructive">
          <AlertDescription>{t('notReady')}</AlertDescription>
        </Alert>
      ) : null}

      <LaunchFormFields
        name={name}
        symbol={symbol}
        description={description}
        supply={supply}
        logo={logo}
        socials={socials}
        socialsOpen={socialsOpen}
        launching={launching}
        symbolSettled={symbolSettled}
        checking={checking}
        available={available}
        launchFee={launchFee}
        total={total}
        onName={setName}
        onSymbol={setSymbol}
        onDescription={setDescription}
        onSupply={setSupply}
        onLogo={setLogo}
        onSocials={setSocials}
        onSocialsOpen={setSocialsOpen}
      />

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Button size="lg" className="w-full" disabled={!canReview} onPress={() => setConfirmOpen(true)}>
        {insufficient && total !== undefined
          ? t('insufficient', { total: formatAmount(total) })
          : t('review')}
      </Button>

      <Sheet
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!launching) setConfirmOpen(open)
        }}
        dismissible={!launching}
        title={t('confirmTitle')}
        description={t('confirmBody')}
      >
        <View className="gap-1.5 rounded-2xl border border-border p-3.5">
          <LaunchRow label={t('nameLabel')} value={name.trim()} />
          <LaunchRow label={t('symbolLabel')} value={normalizeSymbol(symbol)} mono />
          <LaunchRow label={t('supplyLabel')} value={`${supply} ${normalizeSymbol(symbol)}`} />
          <LaunchRow label={t('controlLabel')} value={t('immutableTitle')} />
          <View className="border-t border-border/60 pt-1.5">
            <LaunchRow
              label={tc('total')}
              value={total === undefined ? '—' : `${formatAmount(total)} ICP`}
              emphasis
            />
          </View>
        </View>
        <Alert className="mt-3 flex-row items-start gap-2">
          <AppIcon name="alert" size={16} />
          <AlertDescription>{t('confirmImmutableWarning')}</AlertDescription>
        </Alert>
        <Button className="mt-5 w-full" disabled={launching} onPress={() => void submit()}>
          {launching ? (
            <View className="flex-row items-center gap-2">
              <Spinner />
              <Text className="text-sm font-medium text-primary-foreground">{t('launching')}</Text>
            </View>
          ) : (
            t('confirmLaunch')
          )}
        </Button>
        <Button
          className="mt-2 w-full"
          variant="outline"
          disabled={launching}
          onPress={() => setConfirmOpen(false)}
        >
          {tc('cancel')}
        </Button>
      </Sheet>
    </View>
  )
}
