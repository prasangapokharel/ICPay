import { AppLayoutClient } from "./app-layout-client"

// Client auth gates the page segment until II resolves; opt out of instant
// validation until routes stream wallet data behind Suspense instead.
export const instant = false

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutClient>{children}</AppLayoutClient>
}
