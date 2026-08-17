import { LiveRoomScreen } from "./live-room-screen"

export function generateStaticParams() {
  return [{ id: "id" }]
}

export default function LiveRoomPage() {
  return <LiveRoomScreen />
}
