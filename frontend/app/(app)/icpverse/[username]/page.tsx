import { ProfileView } from "./profile-view"

// output: "export" cannot prerender a route whose parameter values only exist at
// runtime, so a single shell is emitted here and the real username is read from
// the URL on the client. vercel.json rewrites /icpverse/<name> onto this shell.
export function generateStaticParams() {
  return [{ username: "profile" }]
}

export default function ProfilePage() {
  return <ProfileView />
}
