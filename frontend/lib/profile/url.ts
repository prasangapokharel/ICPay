// The public payment link for a handle. Read from the live origin when there is
// one so a link copied on localhost or a preview deployment actually opens; the
// env value is the fallback for anything rendered without a window.
export function profileUrlFor(username: string): string {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL ?? "https://icpay.app"
  return `${origin}/${username}`
}
