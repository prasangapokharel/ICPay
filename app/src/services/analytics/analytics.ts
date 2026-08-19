import type { Identity } from "@icp-sdk/core/agent"
import { call, query, unwrap } from "@/services/client"
import type { AnalyticsData, AnalyticsExportResult, TransactionPublic } from "@/services/types"

export type { AnalyticsData, AnalyticsSummary, AnalyticsExportResult } from "@/services/types"

export function getUserAnalytics(identity: Identity | undefined): Promise<AnalyticsData> {
  return query(identity, async (actor) => unwrap(await actor.getUserAnalytics()))
}

export function exportUserAnalytics(
  identity: Identity | undefined,
): Promise<{ ok: AnalyticsExportResult } | { err: string }> {
  return call(identity, "Export failed", (actor) => actor.exportUserAnalytics())
}

export function analyticsRowCount(rows: TransactionPublic[]): number {
  return rows.length
}
