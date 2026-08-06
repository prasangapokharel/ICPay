import { LaunchDetail } from "./launch-detail"

// output: "export" cannot prerender a route whose parameter values only exist at
// runtime -- token ids are assigned by the canister -- so one shell is emitted
// here and the real id is read from the URL on the client. vercel.json rewrites
// /launch/<id> onto this shell.
export function generateStaticParams() {
  return [{ id: "id" }]
}

export default function LaunchTokenPage() {
  return <LaunchDetail />
}
