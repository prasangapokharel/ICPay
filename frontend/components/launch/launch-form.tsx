"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Tick02Icon,
  Cancel01Icon,
  Alert02Icon,
  InformationCircleIcon,
  Globe02Icon,
  ArrowDown01Icon,
  Coins01Icon,
  AiSecurity01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field"
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
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
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

const SUPPLY_PRESETS = [
  { label: "100M", value: "100,000,000" },
  { label: "300M", value: "300,000,000" },
  { label: "500M", value: "500,000,000" },
  { label: "1B", value: "1,000,000,000" },
] as const

export function LaunchForm({
  onLaunch,
  isAuthenticated = true,
  onConnect,
  connecting = false,
}: {
  onLaunch: (input: LaunchInput) => Promise<string | null>
  isAuthenticated?: boolean
  onConnect?: () => void
  connecting?: boolean
}) {
  const t = useTranslations("launch")
  const tc = useTranslations("common")
  const tl = useTranslations("login")

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

  const debouncedSymbol = useDebounced(symbolError ? "" : symbol)
  const { available, isLoading: checking } = useSymbolAvailability(debouncedSymbol)
  const symbolSettled =
    !symbolError && symbol !== "" && normalizeSymbol(debouncedSymbol) === normalizeSymbol(symbol)

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

  const needsConnect = !isAuthenticated && !!onConnect

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
      immutable: true,
    })
    setLaunching(false)
    if (err) {
      setError(err)
      setConfirmOpen(false)
    }
  }

  return (
    <TooltipProvider delay={200}>
      <div className="flex flex-col gap-6">
        {ready === false && (
          <Alert variant="destructive">
            <HugeiconsIcon icon={Alert02Icon} className="size-4" />
            <AlertDescription>{t("notReady")}</AlertDescription>
          </Alert>
        )}

        {/* Live Token Preview Pill / Header */}
        {(name.trim() || symbol.trim()) && (
          <div className="relative flex items-center justify-between gap-3 overflow-hidden rounded-2xl border border-primary/30 bg-card/80 p-3.5 sm:p-4 shadow-md backdrop-blur-md">
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted/60 border border-border/60">
                {logo ? (
                  <Image src={logo} alt="" width={44} height={44} className="size-full object-cover" unoptimized />
                ) : (
                  <HugeiconsIcon icon={Coins01Icon} className="size-5 text-primary" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="truncate text-base font-bold text-foreground">
                    {name.trim() || "Untitled Token"}
                  </h4>
                  {symbol.trim() && (
                    <span className="shrink-0 rounded-lg bg-primary/15 border border-primary/25 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                      ${normalizeSymbol(symbol)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground pt-0.5">
                  {supply ? `${supply} total supply • ICRC-1 on-chain` : "Set supply and parameters below"}
                </p>
              </div>
            </div>
            <div className="hidden shrink-0 text-right sm:block">
              <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Live Preview
              </span>
            </div>
          </div>
        )}

        <FieldGroup className="gap-5">
          {/* Identity & Branding */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <LogoPicker value={logo} onChange={setLogo} disabled={launching} />

            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <Field>
                <div className="flex items-baseline justify-between">
                  <FieldLabel htmlFor="token-name">{t("nameLabel")}</FieldLabel>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {name.length}/{NAME_MAX_LENGTH}
                  </span>
                </div>
                <Input
                  id="token-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("namePlaceholder")}
                  maxLength={NAME_MAX_LENGTH}
                  autoComplete="off"
                  className="rounded-xl"
                />
                {nameError && (
                  <FieldError>{t(`errors.${nameError}`, { max: NAME_MAX_LENGTH })}</FieldError>
                )}
              </Field>

              <Field>
                <div className="flex items-baseline justify-between">
                  <FieldLabel htmlFor="token-symbol">{t("symbolLabel")}</FieldLabel>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {symbol.length}/{SYMBOL_MAX_LENGTH}
                  </span>
                </div>
                <div className="relative">
                  <Input
                    id="token-symbol"
                    value={symbol}
                    onChange={(e) => setSymbol(normalizeSymbol(e.target.value))}
                    placeholder="MTK"
                    maxLength={SYMBOL_MAX_LENGTH}
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    className="rounded-xl pr-10 font-mono uppercase"
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
                {symbolError ? (
                  <FieldError>{t(`errors.${symbolError}`, { max: SYMBOL_MAX_LENGTH, min: 2 })}</FieldError>
                ) : symbolSettled && available === false ? (
                  <FieldError>{t("symbolTaken", { symbol })}</FieldError>
                ) : null}
              </Field>
            </div>
          </div>

          {/* Description */}
          <Field>
            <div className="flex items-baseline justify-between">
              <FieldLabel htmlFor="token-description">{t("descriptionLabel")}</FieldLabel>
              <span className="text-xs tabular-nums text-muted-foreground">
                {description.length}/{DESCRIPTION_MAX_LENGTH}
              </span>
            </div>
            <Textarea
              id="token-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descriptionPlaceholder")}
              maxLength={DESCRIPTION_MAX_LENGTH}
              className="min-h-20 rounded-xl"
            />
            {descriptionError ? (
              <FieldError>{t(`errors.${descriptionError}`, { max: DESCRIPTION_MAX_LENGTH })}</FieldError>
            ) : null}
          </Field>

          {/* Total Supply */}
          <Field>
            <FieldLabel htmlFor="token-supply">{t("supplyLabel")}</FieldLabel>
            <Input
              id="token-supply"
              value={supply}
              onChange={(e) => setSupply(formatSupply(e.target.value))}
              placeholder="1,000,000,000"
              inputMode="numeric"
              autoComplete="off"
              className="tabular-nums"
            />
            <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
              <span className="text-xs text-muted-foreground mr-1">Presets:</span>
              {SUPPLY_PRESETS.map((preset) => {
                const isSelected = parseSupply(supply) === parseSupply(preset.value)
                return (
                  <Button
                    key={preset.label}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="xs"
                    onClick={() => setSupply(preset.value)}
                    className={cn(
                      "rounded-lg px-2.5 font-mono text-xs cursor-pointer transition-all",
                      isSelected && "shadow-xs ring-1 ring-primary/30"
                    )}
                  >
                    {preset.label}
                  </Button>
                )
              })}
            </div>
            {supplyError ? (
              <FieldError>{t(`errors.${supplyError}`)}</FieldError>
            ) : (
              <FieldDescription>{t("supplyHint")}</FieldDescription>
            )}
          </Field>

          {/* Optional Social Links */}
          <Collapsible open={socialsOpen} onOpenChange={setSocialsOpen} className="w-full">
            <CollapsibleTrigger
              render={
                <Button
                  variant="outline"
                  className="flex w-full items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={Globe02Icon} className="size-4 text-primary" strokeWidth={1.75} />
                    <span>{t("socialsToggle")}</span>
                  </div>
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    className={cn(
                      "size-4 text-muted-foreground transition-transform duration-200",
                      socialsOpen && "rotate-180"
                    )}
                  />
                </Button>
              }
            />
            <CollapsibleContent className="space-y-3.5 pt-3">
              {SOCIAL_FIELDS.map((field, i) => (
                <Field key={field.key}>
                  <FieldLabel htmlFor={`token-${field.key}`}>{t(`${field.key}Label`)}</FieldLabel>
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
                  {socialErrors[i] ? <FieldError>{t(`errors.${socialErrors[i]}`)}</FieldError> : null}
                </Field>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Immutable Guarantee Banner */}
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4">
            <div className="flex items-center gap-2.5">
              <HugeiconsIcon
                icon={AiSecurity01Icon}
                className="size-4.5 text-primary"
                strokeWidth={1.75}
              />
              <p className="text-sm font-semibold text-foreground">{t("immutableTitle")}</p>
            </div>
            <Tooltip>
              <TooltipTrigger
                type="button"
                aria-label={t("immutableTitle")}
                className="inline-flex size-6 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                <HugeiconsIcon icon={InformationCircleIcon} className="size-4 text-primary" strokeWidth={1.75} />
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="end"
                className="max-w-72 p-3 text-left text-[11px] leading-relaxed"
              >
                {t("immutableBody")}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Fee Breakdown Card */}
          <div className="flex flex-col gap-2.5 rounded-2xl border border-border/70 bg-card/60 p-4">
            <Row label={t("creationFee")} value={launchFee === undefined ? "—" : `${formatAmount(launchFee)} ICP`} />
            <Row label={t("networkFee")} value={`${formatAmount(ICP_FEE)} ICP`} muted />
            <div className="border-t border-border/60 pt-2.5">
              <Row
                label={tc("total")}
                value={total === undefined ? "—" : `${formatAmount(total)} ICP`}
                emphasis
              />
            </div>
          </div>
        </FieldGroup>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          size="lg"
          className="w-full"
          disabled={needsConnect ? connecting : !canReview}
          onClick={() => (needsConnect ? onConnect?.() : setConfirmOpen(true))}
        >
          {connecting && <Spinner className="size-4" />}
          {needsConnect
            ? connecting
              ? tl("connecting")
              : t("connectWallet")
            : insufficient && total !== undefined
              ? t("insufficient", { total: formatAmount(total) })
              : t("review")}
        </Button>

        {/* Confirmation Drawer */}
        <Drawer
          open={confirmOpen}
          onOpenChange={(open) => {
            if (!launching) setConfirmOpen(open)
          }}
          showSwipeHandle
        >
          <DrawerContent className="max-w-md mx-auto">
            <DrawerHeader>
              <DrawerTitle className="text-xl font-bold">{t("confirmTitle")}</DrawerTitle>
              <DrawerDescription>{t("confirmBody")}</DrawerDescription>
            </DrawerHeader>

            <div className="space-y-3 px-4 py-2">
              <div className="space-y-2 rounded-2xl border border-border/70 bg-card p-4">
                <Row label={t("nameLabel")} value={name.trim()} />
                <Row label={t("symbolLabel")} value={normalizeSymbol(symbol)} mono />
                <Row label={t("supplyLabel")} value={`${supply} ${normalizeSymbol(symbol)}`} />
                <Row label={t("controlLabel")} value={t("immutableTitle")} />
                <div className="border-t border-border/60 pt-2">
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

            <DrawerFooter className="gap-2">
              <Button
                size="lg"
                className="w-full"
                onClick={handleConfirm}
                disabled={launching}
              >
                {launching && <Spinner className="size-4" />}
                {launching ? t("launching") : t("confirmLaunch")}
              </Button>
              <DrawerClose render={<Button variant="outline" size="lg" className="w-full" disabled={launching}>{tc("cancel")}</Button>} />
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </TooltipProvider>
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
          emphasis && "font-semibold tabular-nums text-foreground"
        )}
      >
        {value}
      </span>
    </div>
  )
}