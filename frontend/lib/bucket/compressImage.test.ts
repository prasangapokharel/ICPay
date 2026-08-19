import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  COMPRESSION_INITIAL_QUALITY,
  COMPRESSION_MAX_EDGE,
  COMPRESSION_MAX_SIZE_MB,
  formatCompressionSummary,
} from "./compress-image"

describe("compression policy constants", () => {
  it("targets sub-700KB WebP for single-call uploads on live canister", () => {
    assert.equal(COMPRESSION_MAX_SIZE_MB, 0.65)
    assert.equal(COMPRESSION_MAX_EDGE, 4096)
    assert.equal(COMPRESSION_INITIAL_QUALITY, 0.85)
  })
})

describe("formatCompressionSummary", () => {
  it("formats byte reduction for UI", () => {
    assert.match(formatCompressionSummary(2_000_000, 400_000), /2\.0 MB → 400 KB WebP/)
  })
})
