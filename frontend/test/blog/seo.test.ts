import assert from "node:assert/strict"
import { blogArticleJsonLd, blogCanonical } from "@/lib/blog/seo"

assert.equal(blogCanonical("how-to-create-icp-canister"), "https://icpay.app/blog/how-to-create-icp-canister")

const ld = blogArticleJsonLd({
  slug: "how-to-create-icp-canister",
  title: "Test",
  description: "Desc",
  publishedAt: "2026-09-05",
  readingMinutes: 10,
})
assert.equal(ld["@type"], "Article")
assert.equal(ld.url, "https://icpay.app/blog/how-to-create-icp-canister")
assert.equal(ld.timeRequired, "PT10M")

console.log("PASS: blog seo helpers")
