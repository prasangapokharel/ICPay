import useSWR from "swr"
import { fetchFiatRates } from "@/lib/fiat/fiat"
import { CURRENCIES } from "@/lib/fiat/config"
import { useFiatCurrency } from "@/components/fiat/fiat-provider"

// A constant key per currency, so every component asking for the same
// conversion shares one cache entry and one request.
function ratesKey(code: string) {
  return ["fiat-rates", code]
}

// Fetches the USD→<currency> rate and formats a USD amount in that currency.
// The provider supplies the active currency; this hook owns the API call.
export function useFiatValue(usdValue: number | null) {
  const { currency } = useFiatCurrency()

  const { data } = useSWR(
    usdValue === null ? null : ratesKey(currency),
    () => fetchFiatRates([currency]),
    {
      dedupingInterval: 300_000,
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    }
  )

  const meta = CURRENCIES.find((c) => c.code === currency)

  let formatted: string | null = null
  if (usdValue !== null && data?.rates?.[currency] != null) {
    const value = usdValue * data.rates[currency]
    formatted = value.toLocaleString(undefined, {
      minimumFractionDigits: value < 1 ? 3 : 2,
      maximumFractionDigits: value < 1 ? 3 : 2,
    })
  }

  return { currency, symbol: meta?.symbol ?? "", formatted }
}
