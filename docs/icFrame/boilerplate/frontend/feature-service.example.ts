// frontend/services/feature/feature.ts
// Canister calls only — no React, no SWR.

import type { Identity } from "@icp-sdk/core/agent"
import { call, type Outcome } from "@/services/client"

export type Feature = {
  id: string
  name: string
}

export function createFeature(
  identity: Identity | undefined,
  name: string,
): Promise<Outcome<Feature>> {
  return call(identity, "Create failed", (actor) => actor.createFeature(name))
}

export function getFeature(id: string): Promise<Outcome<Feature | null>> {
  return call(undefined, "Load failed", (actor) => actor.getFeature(id))
}
