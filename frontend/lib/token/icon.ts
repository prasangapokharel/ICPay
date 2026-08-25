import { ICP_LEDGER_ID } from "@/services/tokens"
import type { TokenMarket } from "@/lib/token/registry"

const ICP_ICON = "/images/logo/logo.png"

export function resolveTokenIcon(
  ledgerId: string,
  logo?: string,
  registry?: Map<string, TokenMarket> | null
): string | undefined {
  if (ledgerId === ICP_LEDGER_ID) return ICP_ICON

  const registryLogo = registry?.get(ledgerId)?.logo
  if (registryLogo?.startsWith("https://")) return registryLogo
  if (logo?.startsWith("https://")) return logo
  if (registryLogo?.startsWith("data:")) return registryLogo
  if (logo?.startsWith("data:")) return logo
  return undefined
}
