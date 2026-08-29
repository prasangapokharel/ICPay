export type BucketDocTitleKey =
  | "docsStorageTitle"
  | "docsCdnTitle"
  | "docsCdnVerifyTitle"
  | "docsApiTitle"
  | "docsMethodListTitle"
  | "docsAuthTitle"
  | "docsBucketsTitle"
  | "docsUploadChunkTitle"
  | "docsReadTitle"
  | "docsWriteTitle"
  | "docsTagsTitle"
  | "docsBulkTitle"
  | "docsApiKeysTitle"
  | "docsPaginationTitle"

export type BucketDocNavItem = {
  id: string
  titleKey: BucketDocTitleKey
  children?: BucketDocNavItem[]
}

export const BUCKET_DOC_NAV: BucketDocNavItem[] = [
  { id: "overview", titleKey: "docsStorageTitle" },
  {
    id: "cdn",
    titleKey: "docsCdnTitle",
    children: [{ id: "cdn-verify", titleKey: "docsCdnVerifyTitle" }],
  },
  {
    id: "api",
    titleKey: "docsApiTitle",
    children: [
      { id: "api-methods", titleKey: "docsMethodListTitle" },
      { id: "api-auth", titleKey: "docsAuthTitle" },
      { id: "buckets", titleKey: "docsBucketsTitle" },
      { id: "upload", titleKey: "docsUploadChunkTitle" },
      { id: "read", titleKey: "docsReadTitle" },
      { id: "write", titleKey: "docsWriteTitle" },
      { id: "tags", titleKey: "docsTagsTitle" },
      { id: "bulk", titleKey: "docsBulkTitle" },
      { id: "keys", titleKey: "docsApiKeysTitle" },
    ],
  },
  { id: "pagination", titleKey: "docsPaginationTitle" },
]

export function bucketDocSectionIds(): string[] {
  const ids: string[] = []
  for (const item of BUCKET_DOC_NAV) {
    ids.push(item.id)
    item.children?.forEach((child) => ids.push(child.id))
  }
  return ids
}
