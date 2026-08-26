import type { Identity } from "@icp-sdk/core/agent"
import { Principal } from "@icp-sdk/core/principal"
import { NnsGovernanceCanister } from "@icp-sdk/canisters/nns"
import { SnsWasmCanister } from "@icp-sdk/canisters/nns"
import { initSnsWrapper } from "@icp-sdk/canisters/sns"
import { createAgent } from "@/services/icp"

const NNS_GOVERNANCE_ID = "rrkah-fqaaa-aaaaa-aaaaq-cai"
const SNS_WASM_ID = "qaa6y-5yaaa-aaaaa-aaafa-cai"

export type ProposalRow = {
  id: bigint
  title: string
  summary: string
  status: string
  source: "nns" | "sns"
  ledgerId?: string
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
    canisterId: Principal.fromText(NNS_GOVERNANCE_ID),
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

async function snsRootForLedger(
  identity: Identity | undefined,
  ledgerId: string
): Promise<Principal | null> {
  const agent = await createAgent(identity)
  const wasm = SnsWasmCanister.create({
    agent,
    canisterId: Principal.fromText(SNS_WASM_ID),
  })
  const rows = await wasm.listSnses({ certified: false })
  const hit = rows.find((r) => r.ledger_canister_id[0]?.toText() === ledgerId)
  return hit?.root_canister_id[0] ?? null
}

export async function fetchSnsMeta(
  identity: Identity | undefined,
  ledgerId: string
): Promise<{ title: string; description: string; url?: string } | null> {
  const root = await snsRootForLedger(identity, ledgerId)
  if (!root) return null

  const agent = await createAgent(identity)
  const sns = await initSnsWrapper({
    certified: false,
    agent,
    rootOptions: { canisterId: root },
  })
  const [meta] = await sns.metadata({ certified: false })
  const title = meta.name[0] ?? ""
  const description = meta.description[0] ?? ""
  const url = meta.url[0]
  if (!title && !description) return null
  return { title, description, url }
}

export async function fetchSnsProposalsForLedger(
  identity: Identity | undefined,
  ledgerId: string,
  limit = 15
): Promise<ProposalRow[]> {
  const root = await snsRootForLedger(identity, ledgerId)
  if (!root) return []

  const agent = await createAgent(identity)
  const sns = await initSnsWrapper({
    certified: false,
    agent,
    rootOptions: { canisterId: root },
  })

  const page = await sns.listProposals({ limit, includeStatus: [] })

  return page.proposals.map((p) => {
    const proposal = p.proposal[0]
    return {
      id: p.id[0]?.id ?? 0n,
      title: proposal?.title ?? `Proposal ${p.id[0]?.id ?? ""}`,
      summary: proposal?.summary ?? "",
      status: p.executed_timestamp_seconds > 0n ? "executed" : "open",
      source: "sns" as const,
      ledgerId,
    }
  })
}

export async function fetchSnsProposalsForHoldings(
  identity: Identity | undefined,
  ledgerIds: string[]
): Promise<ProposalRow[]> {
  const snsLedgers = ledgerIds.slice(0, 5)
  const pages = await Promise.all(
    snsLedgers.map((id) => fetchSnsProposalsForLedger(identity, id, 15))
  )
  return pages.flat().sort((a, b) => Number(b.id - a.id))
}
