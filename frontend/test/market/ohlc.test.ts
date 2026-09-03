import {
  parseIcpswapChartBody,
  ohlcYPad,
  toChartRows,
  ohlcWindowQuery,
  ohlcTickIsTime,
  CHART_INTERVALS,
} from "../../lib/market/ohlc"

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg)
}

const body = {
  code: 200,
  data: {
    content: [
      {
        beginTime: 1_000,
        open: "2",
        high: "4",
        low: "1",
        close: "3",
        volumeUSD: "10",
      },
      {
        beginTime: 3_000,
        open: "3",
        high: "5",
        low: "2.5",
        close: "4",
        volumeUSD: "20",
      },
      {
        beginTime: 2_000,
        open: "3",
        high: "3.5",
        low: "2.8",
        close: "3.2",
        volumeUSD: "8",
      },
    ],
  },
}

const bars = parseIcpswapChartBody(body)
assert(bars.length === 3, "parsed 3")
assert(bars[0].time === 1_000 && bars[2].time === 3_000, "oldest first")
assert(bars[1].close === 3.2, "middle bar")
const [lo, hi] = ohlcYPad(bars)
assert(lo < 1 && hi > 5, "pad around high/low")
const rows = toChartRows(bars)
assert(rows[0].price === 3 && rows[0].up === true, "chart row close")
assert(ohlcWindowQuery("1h").level === "h1" && ohlcWindowQuery("1h").limit === 48, "1h")
assert(ohlcWindowQuery("1d").level === "d1" && ohlcWindowQuery("1d").limit === 90, "1d")
assert(ohlcWindowQuery("1w").level === "d1" && ohlcWindowQuery("1w").limit === 180, "1w")
assert(ohlcTickIsTime("1h") && !ohlcTickIsTime("1d") && !ohlcTickIsTime("1w"), "tick")
assert(CHART_INTERVALS.join(",") === "1h,1d,1w", "intervals")
console.log("ohlc ok", bars.length)
