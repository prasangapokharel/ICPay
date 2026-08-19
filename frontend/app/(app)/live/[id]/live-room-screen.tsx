"use client"

import { LiveRoomView } from "@/components/live/live-room-view"
import { useRewrittenLastSegment } from "@/lib/routing/rewrittenRoute"

export function LiveRoomScreen() {
  const roomId = useRewrittenLastSegment()
  if (!roomId || roomId === "id") {
    return null
  }
  return <LiveRoomView key={roomId} roomId={roomId} />
}
