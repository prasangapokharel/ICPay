export type PendingMessageStatus = "sending" | "sent" | "failed"

export type PendingMessage = {
  clientId: string
  text: string
  status: PendingMessageStatus
  createdAt: bigint
}

export function createPendingMessage(text: string): PendingMessage {
  return {
    clientId: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    text,
    status: "sending",
    createdAt: BigInt(Date.now()) * 1_000_000n,
  }
}
