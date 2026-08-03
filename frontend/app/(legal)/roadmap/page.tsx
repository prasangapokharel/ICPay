import type { Metadata } from "next"
import { RoadmapProgress } from "@/components/roadmap/roadmap-progress"
import { RoadmapStepper } from "@/components/roadmap/roadmap-stepper"
import { RoadmapNotDoing } from "@/components/roadmap/roadmap-not-doing"

export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "What ICPay has shipped, what is being built, and what comes next — multi-token transfers, token creation, on-chain trading, merchant payments.",
  alternates: { canonical: "/roadmap" },
}

export default function RoadmapPage() {
  return (
    <div className="space-y-5 pb-4">
      <header>
        <h1 className="text-xl font-bold tracking-tight">Roadmap</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Ordered by dependency, not by excitement. Each phase unlocks the next, so shipping them
          out of order means building on something that is not there.
        </p>
      </header>

      <RoadmapProgress />
      <RoadmapStepper />
      <RoadmapNotDoing />

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        Dates are deliberately absent. A phase ships when it is safe to ship, and this wallet holds
        real funds.
      </p>
    </div>
  )
}
