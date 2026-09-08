import Link from "next/link"

const HUB_CARDS = [
  {
    href: "/bucket/docs/getting-started/overview",
    title: "What you get",
    description: "Encrypted buckets, CDN delivery, and monthly ICP billing from your ICPay balance.",
  },
  {
    href: "/bucket/docs/getting-started/quickstart",
    title: "Quickstart",
    description: "Install icpay-bucket and upload your first file in under two minutes.",
  },
  {
    href: "/bucket/docs/sdk/typescript",
    title: "TypeScript SDK",
    description: "Install, client setup, and upload for icpay-bucket v1.2+.",
  },
  {
    href: "/bucket/docs/sdk/python",
    title: "Python SDK",
    description: "pip install icpay-bucket and connect with your bucket API key.",
  },
  {
    href: "/bucket/docs/cdn/urls",
    title: "Public CDN URLs",
    description: "Raw IC gateway links and cloud.icpay.app CDN toggle.",
  },
  {
    href: "/bucket/docs/api/methods",
    title: "API reference",
    description: "Full canister method list with TypeScript, Python, and curl examples.",
  },
] as const

export function DocHubCards() {
  return (
    <div className="my-8 grid gap-4 sm:grid-cols-2">
      {HUB_CARDS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="group flex flex-col rounded-xl border border-border/60 bg-card p-5 transition-colors hover:border-primary/40 hover:bg-muted/20"
        >
          <h3 className="font-semibold text-foreground group-hover:text-primary">{item.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
        </Link>
      ))}
    </div>
  )
}
