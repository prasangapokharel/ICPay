import { cn } from "@/lib/ui/utils"

export function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-2.5">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      <div className="space-y-2.5 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  )
}

// Key/value pair for the facts a reader is meant to check against the chain --
// principals and hashes, so the value is monospaced and wraps rather than
// truncating: a half-shown canister id cannot be verified.
export function Row({
  label,
  value,
  mono = true,
}: {
  label: string
  value: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="space-y-1 border-b py-2.5 last:border-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-xs break-all text-foreground", mono && "font-mono")}>
        {value}
      </p>
    </div>
  )
}

export function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-1.5 pl-4">
      {items.map((item, i) => (
        <li key={i} className="list-disc text-sm leading-relaxed text-muted-foreground">
          {item}
        </li>
      ))}
    </ul>
  )
}
