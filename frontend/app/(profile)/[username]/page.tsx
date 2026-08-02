import { PublicProfile } from "./public-profile"

// output: "export" cannot prerender a route whose parameter values only exist at
// runtime, so a single shell is emitted here and the real handle is read from
// the URL on the client. vercel.json rewrites /<handle> onto this shell.
//
// "u" rather than "profile": this route is at the root, so the shell name is
// itself a URL and /profile is already the signed-in profile page. "u" is in
// the reserved list, so it can never be claimed out from under the shell.
export function generateStaticParams() {
  return [{ username: "u" }]
}

export default function ProfilePage() {
  return <PublicProfile />
}
