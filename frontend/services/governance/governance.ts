import type { Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { NnsGovernanceCanister } from "@icp-sdk/canisters/nns"
import { createAgent } from "@/services/icp"
import { NNS_GOVERNANCE_CANISTER_ID } from "@/lib/ic/constants"
import type { SnsProposalRow } from "@/services/sns/proposals"
import { fetchSnsProposalsForHoldings, snsDashboardUrl } from "@/services/sns/proposals"

export type ProposalRow = {
  id: bigint
  title: string
  summary: string
  status: string
  source: "nns" | "sns"
  ledgerId?: string
}

export type ProposalFilter = "all" | "open" | "executed" | "rejected"

export { snsDashboardUrl }

export function filterProposals(rows: ProposalRow[], filter: ProposalFilter): ProposalRow[] {
  if (filter === "all") return rows
  return rows.filter((row) => proposalMatchesFilter(row, filter))
}

function proposalMatchesFilter(row: ProposalRow, filter: ProposalFilter): boolean {
  const s = row.status.toLowerCase()
  switch (filter) {
    case "open":
      return s.includes("open") || s === "adopted"
    case "executed":
      return s.includes("execut") || s === "executed"
    case "rejected":
      return s.includes("reject") || s.includes("fail") || s === "failed"
    default:
      return true
  }
}

function proposalStatusLabel(status: unknown): string {
  if (status == null) return "Unknown"
  if (typeof status === "object") {
    const key = Object.keys(status as Record<string, unknown>)[0]
    return key ?? "Unknown"
  }
  return String(status)
}

export function nnsProposalUrl(id: bigint): string {
  return `https://dashboard.internetcomputer.org/proposal/${id.toString()}`
}

export async function fetchOpenNnsProposals(
  identity?: Identity,
  limit = 30
): Promise<ProposalRow[]> {
  const agent = await createAgent(identity)
  const governance = NnsGovernanceCanister.create({
    agent,
    canisterId: Principal.fromText(NNS_GOVERNANCE_CANISTER_ID),
  })

  const page = await governance.listProposals({
    certified: false,
    request: {
      limit,
      beforeProposal: undefined,
      includeRewardStatus: [],
      excludeTopic: [],
      includeAllManageNeuronProposals: false,
      includeStatus: [],
    },
  })

  return page.proposals.map((p) => ({
    id: p.id ?? 0n,
    title: p.proposal?.title ?? `Proposal ${p.id ?? ""}`,
    summary: p.proposal?.summary ?? "",
    status: proposalStatusLabel(p.status),
    source: "nns" as const,
  }))
}

function toProposalRows(rows: SnsProposalRow[]): ProposalRow[] {
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    summary: row.summary,
    status: row.status,
    source: "sns" as const,
    ledgerId: row.ledgerId,
  }))
}

export async function fetchSnsProposalsForHoldingsAsRows(
  identity: Identity | undefined,
  ledgerIds: string[]
): Promise<ProposalRow[]> {
  const rows = await fetchSnsProposalsForHoldings(identity, ledgerIds)
  return toProposalRows(rows)
}
