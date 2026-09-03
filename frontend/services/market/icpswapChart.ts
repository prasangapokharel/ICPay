import { parseIcpswapChartBody, type IcpswapChartLevel, type OhlcBar } from "@/lib/market/ohlc"

export async function fetchIcpswapOhlc(
  ledgerId: string,
  level: IcpswapChartLevel,
  limit = 200
): Promise<OhlcBar[]> {
  try {
    const res = await fetch(
      `https://api.icpswap.com/info/token/${ledgerId}/chart/${level}?page=1&limit=${limit}`
    )
    if (!res.ok) return []
    return parseIcpswapChartBody(await res.json())
  } catch {
    return []
  }
}
