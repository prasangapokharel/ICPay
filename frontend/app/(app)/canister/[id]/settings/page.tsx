import { CanisterSettingsView } from "./canister-settings-view"

export function generateStaticParams() {
  return [{ id: "id" }]
}

export default function CanisterSettingsPage() {
  return <CanisterSettingsView />
}
