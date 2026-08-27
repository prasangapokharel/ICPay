import type { Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { IcrcLedgerCanister } from "@icp-sdk/canisters/ledger/icrc"
import { createAgent } from "@/services/icp"

export async function fetchTransferConsentMessage(
  identity: Identity | undefined,
  ledgerId: string,
  locale: string
): Promise<string | null> {
  const agent = await createAgent(identity)
  const ledger = IcrcLedgerCanister.create({
    agent,
    canisterId: Principal.fromText(ledgerId),
  })

  try {
    const standards = await ledger.icrc1SupportedStandards({ certified: false })
    if (!standards.some((s) => s.name.toUpperCase().includes("ICRC-21"))) return null

    const info = await ledger.consentMessage({
      method: "icrc1_transfer",
      arg: new Uint8Array(),
      userPreferences: {
        metadata: { language: locale },
        deriveSpec: { GenericDisplay: null },
      },
    })

    const msg = info.consent_message
    if ("GenericDisplay" in msg && typeof msg.GenericDisplay === "string") {
      return msg.GenericDisplay
    }
    if (
      "LineDisplay" in msg &&
      msg.LineDisplay &&
      typeof msg.LineDisplay === "object" &&
      "lines" in msg.LineDisplay
    ) {
      const lines = (msg.LineDisplay as { lines: Array<{ label: string; value: string }> }).lines
      return lines.map((l) => `${l.label}: ${l.value}`).join("\n")
    }
    return null
  } catch {
    return null
  }
}
