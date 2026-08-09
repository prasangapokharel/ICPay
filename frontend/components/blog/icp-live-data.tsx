"use client"

import { useEffect, useState } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { fetchIcpToken, type IcpTokenData } from "@/services/blog/price/price"

const E8S = 1_000_000_00

function fmt(n: number, decimals = 2) {
  return n.toLocaleString("en-US", { maximumFractionDigits: decimals })
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border bg-muted/30 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

function Change({ pct }: { pct: number }) {
  const pos = pct >= 0
  return (
    <span className={pos ? "text-green-600 dark:text-green-400" : "text-destructive"}>
      {pos ? "+" : ""}
      {pct.toFixed(2)}%
    </span>
  )
}

// Volume donut: 24h / 7d / 30d slices shown as proportions
const DONUT_COLORS = ["hsl(var(--primary))", "hsl(var(--primary) / 0.5)", "hsl(var(--primary) / 0.25)"]

export function IcpLiveData() {
  const [data, setData] = useState<IcpTokenData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchIcpToken()
      .then(setData)
      .catch(() => setError(true))
  }, [])

  if (error) return null
  if (!data) {
    return (
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    )
  }

  const { metrics } = data
  const chartData = metrics.chartLast7Days.USD.filter((_, i) => i % 4 === 0).map((p) => ({
    time: p.name.slice(5, 13),
    price: +p.price.toFixed(4),
  }))

  const vol = metrics.volume.usd
  const donutData = [
    { name: "24h", value: vol["24h"] },
    { name: "7d", value: vol["7d"] - vol["24h"] },
    { name: "30d", value: vol["30d"] - vol["7d"] },
  ]

  const supply = Number(data.total_supply) / 10 ** data.decimals
  const fee = Number(data.fee) / 10 ** data.decimals

  return (
    <div className="space-y-6">
      {/* price + change grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Price (USD)" value={`$${fmt(metrics.price.usd, 4)}`} />
        <StatCard label="Market Cap" value={`$${fmt(metrics.fully_diluted_market_cap.usd / 1e6, 1)}M`} />
        <StatCard label="Holders" value={fmt(data.holder_count, 0)} />
        <StatCard label="Transfer fee" value={`${fee} ICP`} />
      </div>

      {/* price changes */}
      <div className="rounded-2xl border p-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Price change</p>
        <div className="grid grid-cols-4 gap-2 text-center">
          {(["24h", "7d", "30d", "90d"] as const).map((p) => (
            <div key={p}>
              <p className="text-[10px] text-muted-foreground">{p}</p>
              <p className="text-xs font-semibold tabular-nums">
                <Change pct={metrics.change[p].usd} />
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 7-day area chart */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Price — last 7 days</p>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
              <XAxis dataKey="time" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={11} />
              <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} domain={["auto", "auto"]} width={38} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8 }}
                formatter={(v) => [`$${Number(v).toFixed(4)}`, "Price"]}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#priceGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* volume donut */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Volume breakdown</p>
        <div className="flex items-center gap-6">
          <div className="h-32 w-32 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={56}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  formatter={(v) => [`$${fmt(Number(v) / 1e6, 1)}M`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 text-sm">
            {donutData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="size-2.5 rounded-sm shrink-0" style={{ background: DONUT_COLORS[i] }} />
                <span className="text-xs text-muted-foreground w-6">{d.name}</span>
                <span className="text-xs font-semibold tabular-nums">${fmt(d.value / 1e6, 1)}M</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* supply stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Total supply"
          value={`${fmt(supply / 1e6, 1)}M ICP`}
        />
        <StatCard label="Standard" value="ICRC-1" sub="Fungible token" />
      </div>

      <p className="text-[10px] text-muted-foreground text-right">
        Data: icptokens.net
      </p>
    </div>
  )
}
