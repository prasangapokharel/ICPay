import type { BucketStatusVariant, BucketVisibilityVariant } from "@/lib/bucket/bucket"

export type { BucketStatusVariant, BucketVisibilityVariant }

export type BucketPublic = {
  id: string
  name: string
  capacity: bigint
  storageUsed: bigint
  visibility: BucketVisibilityVariant
  status: BucketStatusVariant
  expiresAt: bigint
  createdAt: bigint
}

export type BucketStats = {
  id: string
  name: string
  capacity: bigint
  storageUsed: bigint
  usagePercent: bigint
  fileCount: bigint
  visibility: BucketVisibilityVariant
  status: BucketStatusVariant
  expiresAt: bigint
  daysRemaining: bigint
  isExpiringSoon: boolean
  renewPriceE8s: bigint
  periodDays: bigint
  publicBaseUrl: [] | [string]
}

export type BucketRenewQuote = {
  bucketId: string
  priceE8s: bigint
  currentExpiresAt: bigint
  newExpiresAt: bigint
  status: BucketStatusVariant
}

export type BucketRenewResult = {
  bucketId: string
  priceE8s: bigint
  expiresAt: bigint
  status: BucketStatusVariant
}

export type FilePublic = {
  id: string
  path: string
  name: string
  size: bigint
  contentType: string
  createdAt: bigint
  updatedAt: [] | [bigint]
  metadata: [] | [string]
  tags: string[]
  publicUrl: [] | [string]
}

export type FileListPage = {
  items: FilePublic[]
  total: bigint
  page: bigint
  pageSize: bigint
}

export type BucketCycleStatus = {
  balance: bigint
  status: string
  canAcceptNewBuckets: boolean
  estimatedDaysRemaining: bigint
  dailyBurn: bigint
}

export type ApiKeyPermissions = {
  read: boolean
  write: boolean
  delete: boolean
}

export type ApiKeyPublic = {
  id: string
  bucketId: string
  name: string
  keyHint: string
  permissions: ApiKeyPermissions
  createdAt: bigint
  revoked: boolean
}

export type ApiKeyCreateResult = {
  id: string
  secret: string
  name: string
  bucketId: string
  permissions: ApiKeyPermissions
  createdAt: bigint
}
