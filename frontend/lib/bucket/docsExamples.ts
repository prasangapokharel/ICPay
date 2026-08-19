import { rawCloudExample } from "@/lib/bucket/rawCloudUrl"

export type DocsExampleLang = "typescript" | "python" | "curl"

export function cdnUrlExample(): string {
  return rawCloudExample("icp", "/logo.webp")
}

export function curlVerifyExample(): string {
  return `# After upload — expect 200 and content-type: image/webp
curl -sS -I "${rawCloudExample("icp", "/logo.webp")}"`
}
