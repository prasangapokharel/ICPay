import { TokenView } from "./token-view"

// output: "export" cannot prerender a route whose parameter values only exist at
// runtime -- the ledger list is discovered from SNS-W in the browser -- so a
// single shell is emitted here and the real id is read from the URL on the
// client. vercel.json rewrites /token/<ledgerId> onto this shell.
export function generateStaticParams() {
  return [{ ledgerId: "token" }]
}

export default function TokenPage() {
  return <TokenView />
}
