import { redirect } from "next/navigation"

type SwapPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function SwapPage({ searchParams }: SwapPageProps) {
  const params = await searchParams
  const query = new URLSearchParams()
  const from = params.from
  const to = params.to
  if (typeof from === "string") query.set("from", from)
  if (typeof to === "string") query.set("to", to)
  const suffix = query.toString()
  redirect(suffix ? `/trade?${suffix}` : "/trade")
}
