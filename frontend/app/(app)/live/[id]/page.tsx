import { LiveRoomScreen } from "./live-room-screen"

export const instant = false

export function generateStaticParams() {
  return [{ id: "id" }]
}

export default function LiveRoomPage() {
  return <LiveRoomScreen />
}
