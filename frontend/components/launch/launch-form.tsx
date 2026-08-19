"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Tick02Icon,
  Cancel01Icon,
  Alert02Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import { LogoPicker } from "@/components/launch/logo-picker"
import { useDebounced } from "@/hooks/ui/useDebounced"
import { useSymbolAvailability, useLaunchFee, useLaunchReady } from "@/hooks/token/useLaunchData"
import { useLiveBalance } from "@/hooks/wallet/useWalletData"
import { formatAmount, ICP_FEE } from "@/lib/wallet/utils"
import type { LaunchInput } from "@/services/launch/launch"
import {
  NAME_MAX_LENGTH,
  SYMBOL_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  normalizeSymbol,
  validateName,
  validateSymbol,
  validateDescription,
  validateLink,
  validateSupply,
  parseSupply,
  formatSupply,
} from "@/lib/token/launch"
import { cn } from "@/lib/ui/utils"

type Socials = { website: string; telegram: string; twitter: string }

const SOCIAL_FIELDS = [
  { key: "website", placeholder: "https://mytoken.com" },
  { key: "telegram", placeholder: "https://t.me/mytoken" },
  { key: "twitter", placeholder: "https://x.com/mytoken" },
] as const satisfies readonly { key: keyof Socials; placeholder: string }[]

// One-tap whole-token supplies, stored already formatted so the field and the
// canister see the same string the creator would have typed.
const SUPPLY_PRESETS = [
  { label: "100M", value: "100,000,000" },
  { label: "300M", value: "300,000,000" },
  { label: "500M", value: "500,000,000" },
] as const

export function LaunchForm({
  onLaunch,
}: {
  onLaunch: (input: LaunchInput) => Promise<string | null>
}) {
  const t = useTranslations("launch")
  const tc = useTranslations("common")

  const [name, setName] = useState("")
  const [symbol, setSymbol] = useState("")
  const [description, setDescription] = useState("")
  const [supply, setSupply] = useState("")
  const [logo, setLogo] = useState<string | null>(null)
  const [socials, setSocials] = useState<Socials>({ website: "", telegram: "", twitter: "" })
  const [socialsOpen, setSocialsOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [launching, setLaunching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { fee } = useLaunchFee()
  const { ready } = useLaunchReady()
  const balance = useLiveBalance()

  const nameError = name ? validateName(name) : null
  const symbolError = symbol ? validateSymbol(symbol) : null
  const descriptionError = validateDescription(description)
  const supplyError = supply ? validateSupply(supply) : null
  const socialErrors = SOCIAL_FIELDS.map((f) => validateLink(socials[f.key]))

  // Debounced so the availability query runs once per typing pause. Only the
  // settled symbol is asked about, and the verdict is held back until the
  // debounce catches up so it always describes the text on screen.
  const debouncedSymbol = useDebounced(symbolError ? "" : symbol)
  const { available, isLoading: checking } = useSymbolAvailability(debouncedSymbol)
  const symbolSettled =
    !symbolError && symbol !== "" && normalizeSymbol(debouncedSymbol) === normalizeSymbol(symbol)

  // The launch fee and one ledger fee. The 2 ICP hop to the cycles minting
  // canister is paid out of the fee, so the creator is not charged for it.
  const launchFee = fee?.total
  const total = launchFee === undefined ? undefined : launchFee + ICP_FEE
  const insufficient = total !== undefined && balance !== undefined && total > balance

  const complete =
    name.trim() !== "" &&
    symbol !== "" &&
    description.trim() !== "" &&
    supply !== "" &&
    !nameError &&
    !symbolError &&
    !descriptionError &&
    !supplyError &&
    socialErrors.every((e) => e === null)

  const canReview =
    complete && symbolSettled && available === true && !insufficient && ready !== false

  const handleConfirm = async () => {
    const totalSupply = parseSupply(supply)
    if (!totalSupply) return
    setLaunching(true)
    setError(null)
    const err = await onLaunch({
      name,
      symbol,
      description,
      logo: logo ?? undefined,
      website: socials.website || undefined,
      telegram: socials.telegram || undefined,
      twitter: socials.twitter || undefined,
      totalSupply,
      // Every launch is immutable. An upgradeable token keeps its creator as a
      // controller, which ICPay will not list for sending, so offering it only
      // produced tokens the wallet then refused.
      immutable: true,
    })
    setLaunching(false)
    if (err) {
      setError(err)
      setConfirmOpen(false)
    }
  }

  return (
    <div className="space-y-4">
      {ready === false && (
        <Alert variant="destructive">
          <HugeiconsIcon icon={Alert02Icon} className="size-4" />
          <AlertDescription>{t("notReady")}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <LogoPicker value={logo} onChange={setLogo} disabled={launching} />

        <div className="min-w-0 flex-1 space-y-3">
          <Field
            id="token-name"
            label={t("nameLabel")}
            count={`${name.length}/${NAME_MAX_LENGTH}`}
            error={nameError && t(`errors.${nameError}`, { max: NAME_MAX_LENGTH })}
          >
            <Input
              id="token-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              maxLength={NAME_MAX_LENGTH}
              autoComplete="off"
            />
          </Field>

          <Field
            id="token-symbol"
            label={t("symbolLabel")}
            count={`${symbol.length}/${SYMBOL_MAX_LENGTH}`}
            error={symbolError && t(`errors.${symbolError}`, { max: SYMBOL_MAX_LENGTH, min: 2 })}
          >
            <div className="relative">
              <Input
                id="token-symbol"
                value={symbol}
                // Uppercased as typed: this is the form that will be compared
                // and the form the token will trade under.
                onChange={(e) => setSymbol(normalizeSymbol(e.target.value))}
                placeholder="MTK"
                maxLength={SYMBOL_MAX_LENGTH}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                className="pr-10 font-mono uppercase"
              />
              {symbolSettled && !checking && available !== null && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  <HugeiconsIcon
                    icon={available ? Tick02Icon : Cancel01Icon}
                    className={cn("size-5", available ? "text-success" : "text-destructive")}
                  />
                </span>
              )}
              {(checking || (symbol !== "" && !symbolError && !symbolSettled)) && (
                <Spinner className="absolute right-3 top-1/2 size-4 -translate-y-1/2" />
              )}
            </div>
          </Field>
        </div>
      </div>

      {symbolSettled && available === false && (
        <p className="-mt-2 text-xs text-destructive">{t("symbolTaken", { symbol })}</p>
      )}

      <Field
        id="token-description"
        label={t("descriptionLabel")}
        count={`${description.length}/${DESCRIPTION_MAX_LENGTH}`}
        error={descriptionError && t(`errors.${descriptionError}`, { max: DESCRIPTION_MAX_LENGTH })}
      >
        <Textarea
          id="token-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("descriptionPlaceholder")}
          maxLength={DESCRIPTION_MAX_LENGTH}
          className="min-h-20"
        />
      </Field>

      <Field
        id="token-supply"
        label={t("supplyLabel")}
        error={supplyError && t(`errors.${supplyError}`)}
        hint={t("supplyHint")}
      >
        <Input
          id="token-supply"
          value={supply}
          // Grouped as typed. An unpunctuated nine-digit supply is the kind of
          // number people ship one zero off from what they meant.
          onChange={(e) => setSupply(formatSupply(e.target.value))}
          placeholder="1,000,000,000"
          inputMode="numeric"
          autoComplete="off"
          className="tabular-nums"
        />
        <div className="flex flex-wrap gap-2 pt-1.5">
          {SUPPLY_PRESETS.map((preset) => (
            <Button
              key={preset.label}
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "h-7 rounded-lg px-3 text-xs",
                parseSupply(supply) === parseSupply(preset.value) &&
                  "bg-gradient-to-br from-amber-200 via-yellow-300 to-amber-500 text-amber-950"
              )}
              onClick={() => setSupply(preset.value)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </Field>

      <Collapsible open={socialsOpen} onOpenChange={setSocialsOpen}>
        <CollapsibleTrigger
          render={
            <Button variant="ghost" size="sm" className="h-auto px-0 text-xs text-muted-foreground">
              {t("socialsToggle")}
            </Button>
          }
        />
        <CollapsibleContent className="space-y-3 pt-3">
          {SOCIAL_FIELDS.map((field, i) => (
            <Field
              key={field.key}
              id={`token-${field.key}`}
              label={t(`${field.key}Label`)}
              error={socialErrors[i] && t(`errors.${socialErrors[i]}`)}
            >
              <Input
                id={`token-${field.key}`}
                value={socials[field.key]}
                onChange={(e) => setSocials({ ...socials, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                inputMode="url"
                autoComplete="off"
                spellCheck={false}
                className="text-xs"
              />
            </Field>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* One statement rather than a choice. The launch is irreversible and the
          only outcome ICPay will list for sending, so it is stated, not asked. */}
      <div className="flex items-center gap-1.5">
        <p className="text-sm font-medium">{t("immutableTitle")}</p>
        <Tooltip>
          <TooltipTrigger
            render={
              <HugeiconsIcon
                icon={InformationCircleIcon}
                className="size-4 shrink-0 cursor-help text-muted-foreground"
              />
            }
          />
          <TooltipContent side="right" className="max-w-64 text-[11px] leading-relaxed">
            {t("immutableBody")}
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="space-y-2 rounded-2xl bg-muted/40 p-3.5">
        <Row label={t("creationFee")} value={launchFee === undefined ? "—" : `${formatAmount(launchFee)} ICP`} />
        <Row label={t("networkFee")} value={`${formatAmount(ICP_FEE)} ICP`} muted />
        <div className="border-t pt-2">
          <Row
            label={tc("total")}
            value={total === undefined ? "—" : `${formatAmount(total)} ICP`}
            emphasis
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        size="lg"
        className="w-full bg-gradient-to-br from-amber-200 via-yellow-300 to-amber-500 text-amber-950 hover:from-amber-200 hover:via-yellow-300 hover:to-amber-500"
        disabled={!canReview}
        onClick={() => setConfirmOpen(true)}
      >
        {insufficient && total !== undefined
          ? t("insufficient", { total: formatAmount(total) })
          : t("review")}
      </Button>

      {/* The confirm step is not ceremony: the fee is charged before the ledger
          canister exists, and nothing about a launch can be undone afterwards. */}
      <Drawer
        open={confirmOpen}
        onOpenChange={(open) => {
          // Closing mid-launch would leave the creator on the form with a call
          // in flight, and a second press would be a second 5 ICP.
          if (!launching) setConfirmOpen(open)
        }}
        showSwipeHandle
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{t("confirmTitle")}</DrawerTitle>
            <DrawerDescription>{t("confirmBody")}</DrawerDescription>
          </DrawerHeader>

          <div className="space-y-3 px-4">
            <div className="space-y-1.5 rounded-2xl border p-3.5">
              <Row label={t("nameLabel")} value={name.trim()} />
              <Row label={t("symbolLabel")} value={normalizeSymbol(symbol)} mono />
              <Row label={t("supplyLabel")} value={`${supply} ${normalizeSymbol(symbol)}`} />
              <Row label={t("controlLabel")} value={t("immutableTitle")} />
              <div className="border-t pt-1.5">
                <Row
                  label={tc("total")}
                  value={total === undefined ? "—" : `${formatAmount(total)} ICP`}
                  emphasis
                />
              </div>
            </div>

            <Alert>
              <HugeiconsIcon icon={Alert02Icon} className="size-4" />
              <AlertDescription>{t("confirmImmutableWarning")}</AlertDescription>
            </Alert>
          </div>

          <DrawerFooter>
            <Button
              onClick={handleConfirm}
              disabled={launching}
              className="bg-gradient-to-br from-amber-200 via-yellow-300 to-amber-500 text-amber-950 hover:from-amber-200 hover:via-yellow-300 hover:to-amber-500"
            >
              {launching && <Spinner className="size-4" />}
              {launching ? t("launching") : t("confirmLaunch")}
            </Button>
            <DrawerClose render={<Button variant="outline" disabled={launching}>{tc("cancel")}</Button>} />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

function Field({
  id,
  label,
  count,
  error,
  hint,
  children,
}: {
  id: string
  label: string
  count?: string
  error?: string | null
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <Label htmlFor={id}>{label}</Label>
        {count && <span className="text-xs tabular-nums text-muted-foreground">{count}</span>}
      </div>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}

function Row({
  label,
  value,
  mono,
  muted,
  emphasis,
}: {
  label: string
  value: string
  mono?: boolean
  muted?: boolean
  emphasis?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "min-w-0 break-all text-right text-sm",
          mono && "font-mono text-xs",
          muted && "text-muted-foreground",
          emphasis && "font-semibold tabular-nums"
        )}
      >
        {value}
      </span>
    </div>
  )
}