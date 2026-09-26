"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShineBorder } from "@/components/ui/shine-border"
import {
  BACKEND_CANISTER_ID,
  BLOB_STORE_CANISTER_ID,
  FRONTEND_CANISTER_ID,
  TRADE_CANISTER_ID,
} from "@/lib/ic/constants"

type CanisterItem = {
  name: string
  status: string
  canisterId: string
  description: string
}

const CANISTERS: CanisterItem[] = [
  {
    name: "Backend",
    status: "Live",
    canisterId: BACKEND_CANISTER_ID,
    description: "Core Motoko canister managing deterministic user subaccounts, registry, and official ICP ledger transfers.",
  },
  {
    name: "Frontend",
    status: "Live",
    canisterId: FRONTEND_CANISTER_ID,
    description: "Asset canister hosting the application bundle and serving the official Internet Identity derivation origin.",
  },
  {
    name: "Trade",
    status: "Live",
    canisterId: TRADE_CANISTER_ID,
    description: "On-chain trade execution, swap routing, and decentralized market preflight validation.",
  },
  {
    name: "Bucket",
    status: "Live",
    canisterId: BLOB_STORE_CANISTER_ID,
    description: "Decentralized on-chain storage canister powering S3-compatible file storage and blob verification.",
  },
]

const GUARANTEES = [
  {
    title: "Consensus",
    value: "Subnet Replicated",
    detail: "Threshold ECDSA and Byzantine fault tolerant consensus across decentralized nodes.",
  },
  {
    title: "Custody",
    value: "Isolated Subaccounts",
    detail: "Each user funds are locked in personal subaccounts; never commingled in pooled hot wallets.",
  },
  {
    title: "Bytecode",
    value: "Verifiable WASM",
    detail: "Canister builds produce provable bytecode hashes matching the open-source repository.",
  },
  {
    title: "Identity",
    value: "Internet Identity",
    detail: "Hardware-backed passkeys via WebAuthn. No seed phrases to leak or lose.",
  },
]

export function LandingTransparency() {
  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Heading, Context, and Security Architecture */}
          <div className="space-y-6 lg:col-span-5">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                All in progress
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight bg-linear-to-b from-foreground via-foreground/90 to-foreground/50 bg-clip-text text-transparent md:text-4xl">
                Canisters
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                Every transaction, user balance, and decentralized service runs on verifiable Internet
                Computer canisters under global consensus.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-border/80 bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-foreground"
                >
                  100% On-Chain & Auditable
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button
                  size="default"
                  nativeButton={false}
                  render={<Link href="/transparency" />}
                  className="rounded-full px-5 text-xs font-medium"
                >
                  View Transparency Report
                </Button>
                <Button
                  variant="outline"
                  size="default"
                  nativeButton={false}
                  render={
                    <a
                      href={`https://dashboard.internetcomputer.org/canister/${BACKEND_CANISTER_ID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                  className="gap-1.5 rounded-full px-4 text-xs font-medium text-foreground"
                >
                  <span>ICP Dashboard</span>
                  <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-3.5 text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* Formal Security Architecture Card */}
            <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
              <div className="space-y-3.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Canister Security Architecture
                </p>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {GUARANTEES.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-xl border border-border/60 bg-muted/30 p-3"
                    >
                      <p className="text-[11px] font-medium text-muted-foreground">{item.title}</p>
                      <p className="mt-0.5 text-xs font-semibold text-foreground">{item.value}</p>
                      <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Canister Cards */}
          <div className="grid gap-3 sm:gap-4 lg:col-span-7">
            {CANISTERS.map((item) => (
              <div
                key={item.name}
                className="relative overflow-hidden rounded-xl border border-border/70 bg-card p-4 sm:p-5 shadow-xs transition-colors hover:border-border"
              >
                {item.name === "Backend" && (
                  <ShineBorder
                    className="rounded-xl"
                    borderWidth={1.2}
                    duration={14}
                    shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
                  />
                )}
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-base font-semibold text-foreground">
                      {item.name}
                    </span>


                  </div>

                  <div className="flex w-full items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/40 px-3 py-1.5">
                    <span className="font-mono text-xs tracking-wider text-muted-foreground truncate select-all">
                      {item.canisterId}
                    </span>
                    <Button
                      size="xs"
                      variant="default"
                      nativeButton={false}
                      render={
                        <a
                          href={`https://dashboard.internetcomputer.org/canister/${item.canisterId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                      className="h-6 shrink-0 rounded-full px-2.5 text-[11px] font-medium shadow-xs"
                    >
                      <span>Explorer</span>
                    </Button>
                  </div>

                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section >
  )
}
