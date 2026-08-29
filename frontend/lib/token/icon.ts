import { ICP_LEDGER_ID, ICPAY_LEDGER_ID } from "@/services/tokens"
import type { TokenMarket } from "@/lib/token/registry"
import { ICPAY_TOKEN_ICON } from "@/lib/ui/brand-images"

export const ICP_LOGO = "/images/logo/icp/icp_logo.014fd35c.svg"

export function resolveTokenIcon(
  ledgerId: string,
  logo?: string,
  registry?: Map<string, TokenMarket> | null
): string | undefined {
  if (ledgerId === ICP_LEDGER_ID) return ICP_LOGO
  if (ledgerId === ICPAY_LEDGER_ID) return ICPAY_TOKEN_ICON

  const registryLogo = registry?.get(ledgerId)?.logo
  if (registryLogo?.startsWith("https://")) return registryLogo
  if (logo?.startsWith("https://")) return logo
  if (registryLogo?.startsWith("data:")) return registryLogo
  if (logo?.startsWith("data:")) return logo
  return undefined
}
