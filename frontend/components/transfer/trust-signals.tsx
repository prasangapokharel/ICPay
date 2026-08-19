"use client"

import { useTranslations } from "next-intl"
import { computeRiskScore, type RiskLevel } from "@/lib/market/riskScore"
import { cn } from "@/lib/ui/utils"

const SIZE = 40
const R = 16
const CIRC = 2 * Math.PI * R

function levelColor(level: RiskLevel) {
  if (level === "low") return "text-green-500 dark:text-green-400"
  if (level === "medium") return "text-amber-500 dark:text-amber-400"
  return "text-destructive"
}

function levelStroke(level: RiskLevel) {
  if (level === "low") return "stroke-green-500 dark:stroke-green-400"
  if (level === "medium") return "stroke-amber-500 dark:stroke-amber-400"
  return "stroke-destructive"
}

// Small SVG ring with the score number inside, matching the reference design.
// Shown in the gift-icon slot so the card layout stays the same.
export function ScoreCircle({
  username,
  createdAtNs,
  txCount,
}: {
  username: string
  createdAtNs: bigint | undefined
  txCount: number | null
}) {
  const t = useTranslations("trustSignals")

  const { score, level } = computeRiskScore({
    username: username || null,
    createdAtNs: createdAtNs ?? null,
    txCount,
    // Reason keys not needed for the circle — tooltip pulls them separately.
    reasonKeys: {
      hasUsername: "",
      badgePremium: "",
      badgeUltra: "",
      accountAge: "",
      hasTx: "",
      brandSimilar: "",
    },
  })

  // Dashed ring: how much of the circle is filled = score / 100.
  const dash = (score / 100) * CIRC
  const gap = CIRC - dash

  return (
    <div
      className="relative shrink-0"
      style={{ width: SIZE, height: SIZE }}
      title={t(level === "low" ? "levelLow" : level === "medium" ? "levelMedium" : "levelHigh", { score })}
      aria-label={t(level === "low" ? "levelLow" : level === "medium" ? "levelMedium" : "levelHigh", { score })}
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Track */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          strokeWidth={3}
          className="stroke-muted"
        />
        {/* Progress */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          strokeWidth={3}
          strokeDasharray={`${dash} ${gap}`}
          strokeLinecap="round"
          className={cn("transition-all duration-500", levelStroke(level))}
        />
      </svg>
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center text-[11px] font-bold tabular-nums",
          levelColor(level),
        )}
      >
        {score}
      </span>
    </div>
  )
}
