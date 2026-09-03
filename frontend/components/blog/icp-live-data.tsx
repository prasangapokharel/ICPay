"use client"

import { useEffect, useState } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { fetchIcpToken, type IcpTokenData } from "@/services/blog/price/price"

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
  const chartData = metrics.chartLast7Days.USD.filter((_, i) => i % 2 === 0).map((p) => ({
    time: p.name.slice(5, 13),
    price: +p.price.toFixed(4),
  }))

  const supply = Number(data.total_supply) / 10 ** data.decimals
  const fee = Number(data.fee) / 10 ** data.decimals
  const vol = metrics.volume.usd

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Price (USD)" value={`$${fmt(metrics.price.usd, 4)}`} />
        <StatCard
          label="Market Cap"
          value={`$${fmt(metrics.fully_diluted_market_cap.usd / 1e6, 1)}M`}
        />
        <StatCard label="Holders" value={fmt(data.holder_count, 0)} />
        <StatCard label="Transfer fee" value={`${fee} ICP`} />
      </div>

      <div className="rounded-2xl border p-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Price change
        </p>
        <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
          <div>
            <p className="text-[10px] text-muted-foreground">24h</p>
            <p className="text-xs font-semibold tabular-nums">
              <Change pct={metrics.change["24h"].usd} />
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">24h vol</p>
            <p className="text-xs font-semibold tabular-nums">${fmt(vol["24h"] / 1e6, 1)}M</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">7d vol</p>
            <p className="text-xs font-semibold tabular-nums">${fmt(vol["7d"] / 1e6, 1)}M</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">FDV</p>
            <p className="text-xs font-semibold tabular-nums">
              ${fmt(metrics.fully_diluted_market_cap.usd / 1e6, 0)}M
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Price — last 7 days
        </p>
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
              <YAxis
                tick={{ fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                domain={["auto", "auto"]}
                width={38}
                tickFormatter={(v) => `$${v}`}
              />
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

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total supply" value={`${fmt(supply / 1e6, 1)}M ICP`} />
        <StatCard label="Standard" value="ICRC-1" sub="Fungible token" />
      </div>

      <p className="text-[10px] text-muted-foreground text-right">
        Data: icrc-api.internetcomputer.org
      </p>
    </div>
  )
}
