import { parseIcpswapChartBody, ohlcYPad, toChartRows, ohlcWindowQuery } from "../../lib/market/ohlc"

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
assert(ohlcWindowQuery("24h").level === "h1" && ohlcWindowQuery("24h").limit === 48, "24h")
assert(ohlcWindowQuery("7d").level === "d1" && ohlcWindowQuery("7d").limit === 90, "7d")
console.log("ohlc ok", bars.length)
