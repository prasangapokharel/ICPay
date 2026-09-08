import type { Metadata } from "next"
import { CommandsHero } from "@/components/products/icfalcon/commands-hero"
import { CommandsTable } from "@/components/products/icfalcon/commands-table"

export const metadata: Metadata = {
  title: "Falcon CLI Commands - ICFalcon Framework",
  description:
    "Complete reference for falcon CLI commands. Setup, backend build, deployment, canister management, cycles, packages, and scaffolding for ICFalcon Motoko framework.",
  keywords: [
    "falcon CLI",
    "ICFalcon commands",
    "Motoko CLI",
    "ICP CLI",
    "canister deployment",
    "dfx commands",
  ],
  alternates: { canonical: "/products/icFalcon/commands" },
}

export default function CommandsPage() {
  return (
    <div className="min-h-screen">
      <CommandsHero />
      <CommandsTable />
    </div>
  )
}
