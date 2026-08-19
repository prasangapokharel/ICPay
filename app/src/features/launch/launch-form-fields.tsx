import { Pressable, View } from 'react-native'
import { useTranslations } from '@/components/i18n/locale-provider'
import { AppIcon } from '@/components/ui/app-icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { LaunchField, LaunchRow } from '@/features/launch/launch-field'
import { LaunchInfoPop } from '@/features/launch/launch-info-pop'
import { LaunchLogoPicker } from '@/features/launch/launch-logo-picker'
import {
  DESCRIPTION_MAX_LENGTH,
  NAME_MAX_LENGTH,
  SYMBOL_MAX_LENGTH,
  formatSupply,
  normalizeSymbol,
  parseSupply,
  validateDescription,
  validateLink,
  validateName,
  validateSupply,
  validateSymbol,
} from '@/lib/launch'
import { formatAmount, ICP_FEE } from '@/lib/wallet-utils'

export type Socials = { website: string; telegram: string; twitter: string }

export const SOCIAL_FIELDS = [
  { key: 'website', placeholder: 'https://mytoken.com' },
  { key: 'telegram', placeholder: 'https://t.me/mytoken' },
  { key: 'twitter', placeholder: 'https://x.com/mytoken' },
] as const satisfies readonly { key: keyof Socials; placeholder: string }[]

const SUPPLY_PRESETS = [
  { label: '100M', value: '100,000,000' },
  { label: '300M', value: '300,000,000' },
  { label: '500M', value: '500,000,000' },
] as const

export function LaunchFormFields({
  name,
  symbol,
  description,
  supply,
  logo,
  socials,
  socialsOpen,
  launching,
  symbolSettled,
  checking,
  available,
  launchFee,
  total,
  onName,
  onSymbol,
  onDescription,
  onSupply,
  onLogo,
  onSocials,
  onSocialsOpen,
}: {
  name: string
  symbol: string
  description: string
  supply: string
  logo: string | null
  socials: Socials
  socialsOpen: boolean
  launching: boolean
  symbolSettled: boolean
  checking: boolean
  available: boolean | null
  launchFee: bigint | undefined
  total: bigint | undefined
  onName: (value: string) => void
  onSymbol: (value: string) => void
  onDescription: (value: string) => void
  onSupply: (value: string) => void
  onLogo: (logo: string | null) => void
  onSocials: (socials: Socials) => void
  onSocialsOpen: (open: boolean) => void
}) {
  const t = useTranslations('launch')
  const tc = useTranslations('common')
  const nameErr = name ? validateName(name) : null
  const symbolErr = symbol ? validateSymbol(symbol) : null
  const descErr = validateDescription(description)
  const supplyErr = supply ? validateSupply(supply) : null
  const socialErrs = SOCIAL_FIELDS.map((field) => validateLink(socials[field.key]))
  const waiting = checking || (symbol !== '' && !symbolErr && !symbolSettled)

  return (
    <View className="gap-4">
      <View className="flex-row gap-3">
        <LaunchLogoPicker value={logo} onChange={onLogo} disabled={launching} />
        <View className="min-w-0 flex-1 gap-3">
          <LaunchField
            label={t('nameLabel')}
            count={`${name.length}/${NAME_MAX_LENGTH}`}
            error={nameErr ? t(`errors.${nameErr}`, { max: NAME_MAX_LENGTH }) : null}
          >
            <Input
              value={name}
              onChangeText={onName}
              placeholder={t('namePlaceholder')}
              maxLength={NAME_MAX_LENGTH}
              autoComplete="off"
            />
          </LaunchField>
          <LaunchField
            label={t('symbolLabel')}
            count={`${symbol.length}/${SYMBOL_MAX_LENGTH}`}
            error={symbolErr ? t(`errors.${symbolErr}`, { max: SYMBOL_MAX_LENGTH, min: 2 }) : null}
          >
            <View className="relative">
              <Input
                value={symbol}
                onChangeText={(value) => onSymbol(normalizeSymbol(value))}
                placeholder="MTK"
                maxLength={SYMBOL_MAX_LENGTH}
                autoCapitalize="characters"
                autoComplete="off"
                autoCorrect={false}
                className="pr-10 font-mono uppercase"
              />
              <View className="absolute top-2 right-3">
                {waiting ? <Spinner /> : null}
                {symbolSettled && !checking && available === true ? <AppIcon name="check" size={18} /> : null}
                {symbolSettled && !checking && available === false ? <AppIcon name="close" size={18} /> : null}
              </View>
            </View>
          </LaunchField>
        </View>
      </View>

      {symbolSettled && available === false ? (
        <Text className="-mt-2 text-xs text-destructive">{t('symbolTaken', { symbol })}</Text>
      ) : null}

      <LaunchField
        label={t('descriptionLabel')}
        count={`${description.length}/${DESCRIPTION_MAX_LENGTH}`}
        error={descErr ? t(`errors.${descErr}`, { max: DESCRIPTION_MAX_LENGTH }) : null}
      >
        <Input
          value={description}
          onChangeText={onDescription}
          placeholder={t('descriptionPlaceholder')}
          maxLength={DESCRIPTION_MAX_LENGTH}
          multiline
          textAlignVertical="top"
          className="h-20 py-2.5"
        />
      </LaunchField>

      <LaunchField
        label={t('supplyLabel')}
        error={supplyErr ? t(`errors.${supplyErr}`) : null}
        hint={t('supplyHint')}
      >
        <Input
          value={supply}
          onChangeText={(value) => onSupply(formatSupply(value))}
          placeholder="1,000,000,000"
          keyboardType="number-pad"
          autoComplete="off"
          className="tabular-nums"
        />
        <View className="flex-row flex-wrap gap-2 pt-1.5">
          {SUPPLY_PRESETS.map((preset) => {
            const selected = parseSupply(supply) === parseSupply(preset.value)
            return (
              <Button
                key={preset.label}
                size="sm"
                variant={selected ? 'default' : 'outline'}
                className="h-7 rounded-lg px-3"
                textClassName="text-xs"
                onPress={() => onSupply(preset.value)}
              >
                {preset.label}
              </Button>
            )
          })}
        </View>
      </LaunchField>

      <View>
        <Pressable onPress={() => onSocialsOpen(!socialsOpen)} className="min-h-8 justify-center">
          <Text className="text-xs text-muted-foreground">{t('socialsToggle')}</Text>
        </Pressable>
        {socialsOpen ? (
          <View className="gap-3 pt-3">
            {SOCIAL_FIELDS.map((field, i) => (
              <LaunchField
                key={field.key}
                label={t(`${field.key}Label`)}
                error={socialErrs[i] ? t(`errors.${socialErrs[i]}`) : null}
              >
                <Input
                  value={socials[field.key]}
                  onChangeText={(value) => onSocials({ ...socials, [field.key]: value })}
                  placeholder={field.placeholder}
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect={false}
                  keyboardType="url"
                  className="text-xs"
                />
              </LaunchField>
            ))}
          </View>
        ) : null}
      </View>

      <View className="flex-row items-center">
        <Text className="text-sm font-medium">{t('immutableTitle')}</Text>
        <LaunchInfoPop body={t('immutableBody')} />
      </View>

      <View className="gap-2 rounded-2xl bg-muted/40 p-3.5">
        <LaunchRow
          label={t('creationFee')}
          value={launchFee === undefined ? '—' : `${formatAmount(launchFee)} ICP`}
        />
        <LaunchRow label={t('networkFee')} value={`${formatAmount(ICP_FEE)} ICP`} muted />
        <View className="border-t border-border/60 pt-2">
          <LaunchRow
            label={tc('total')}
            value={total === undefined ? '—' : `${formatAmount(total)} ICP`}
            emphasis
          />
        </View>
      </View>
    </View>
  )
}
