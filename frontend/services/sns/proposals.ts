import type { Identity } from "@icp-sdk/core/agent"
import { initSnsWrapper } from "@icp-sdk/canisters/sns"
import { createAgent } from "@/services/icp"
import {
  fetchSnsRegistryList,
  snsRootPrincipal,
  type SnsRegistryRow,
} from "@/services/sns/registry"

export type SnsProposalRow = {
  id: bigint
  title: string
  summary: string
  status: string
  ledgerId: string
}

export type SnsTokenMeta = {
  title: string
  description: string
  url?: string
}

type SnsProposalData = {
  executed_timestamp_seconds: bigint
  failed_timestamp_seconds: bigint
  failure_reason: unknown[]
  decided_timestamp_seconds: bigint
}

export function snsDashboardUrl(rootCanisterId: string): string {
  return `https://dashboard.internetcomputer.org/sns/${rootCanisterId}`
}

export function snsProposalStatus(proposal: SnsProposalData): string {
  if (proposal.executed_timestamp_seconds > 0n) return "Executed"
  if (proposal.failed_timestamp_seconds > 0n) return "Failed"
  if (proposal.failure_reason.length > 0) return "Rejected"
  if (proposal.decided_timestamp_seconds > 0n) return "Adopted"
  return "Open"
}

async function snsWrapperForLedger(
  identity: Identity | undefined,
  ledgerId: string,
  rows?: SnsRegistryRow[]
) {
  const registry = rows ?? (await fetchSnsRegistryList(identity))
  const root = snsRootPrincipal(registry, ledgerId)
  if (!root) return null

  const agent = await createAgent(identity)
  const sns = await initSnsWrapper({
    certified: false,
    agent,
    rootOptions: { canisterId: root },
  })
  return { sns, root }
}

export async function fetchSnsMeta(
  identity: Identity | undefined,
  ledgerId: string
): Promise<SnsTokenMeta | null> {
  const wrapped = await snsWrapperForLedger(identity, ledgerId)
  if (!wrapped) return null

  const [meta] = await wrapped.sns.metadata({ certified: false })
  const title = meta.name[0] ?? ""
  const description = meta.description[0] ?? ""
  const url = meta.url[0]
  if (!title && !description) return null
  return { title, description, url }
}

export async function fetchSnsProposalsForLedger(
  identity: Identity | undefined,
  ledgerId: string,
  limit = 15,
  registryRows?: SnsRegistryRow[]
): Promise<SnsProposalRow[]> {
  const wrapped = await snsWrapperForLedger(identity, ledgerId, registryRows)
  if (!wrapped) return []

  const page = await wrapped.sns.listProposals({ limit, includeStatus: [] })

  return page.proposals.map((p) => {
    const proposal = p.proposal[0]
    return {
      id: p.id[0]?.id ?? 0n,
      title: proposal?.title ?? `Proposal ${p.id[0]?.id ?? ""}`,
      summary: proposal?.summary ?? "",
      status: snsProposalStatus(p),
      ledgerId,
    }
  })
}

export async function fetchSnsProposalsForHoldings(
  identity: Identity | undefined,
  ledgerIds: string[]
): Promise<SnsProposalRow[]> {
  const registry = await fetchSnsRegistryList(identity)
  const snsLedgers = ledgerIds.slice(0, 5)
  const pages = await Promise.all(
    snsLedgers.map((id) => fetchSnsProposalsForLedger(identity, id, 15, registry))
  )
  return pages.flat().sort((a, b) => Number(b.id - a.id))
}
