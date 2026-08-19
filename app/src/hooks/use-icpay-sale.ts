import useSWR from 'swr'
import { getIcpaySale, type IcpaySaleQuote } from '@/services/icpay/sale'

export function useIcpaySale(): {
  sale: IcpaySaleQuote | undefined
  rate: bigint | undefined
  isLoading: boolean
  refresh: () => Promise<IcpaySaleQuote | undefined>
} {
  const { data: sale, isLoading, mutate } = useSWR('icpay-sale', getIcpaySale, {
    keepPreviousData: true,
    dedupingInterval: 30_000,
    refreshInterval: 60_000,
    revalidateIfStale: false,
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })

  return {
    sale,
    rate: sale?.rate,
    isLoading,
    refresh: mutate,
  }
}
