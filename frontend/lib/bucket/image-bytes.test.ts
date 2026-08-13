import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { validatePngHeader, validateWebpHeader } from "./image-bytes"

describe("validateWebpHeader", () => {
  it("accepts RIFF....WEBP signature", () => {
    const bytes = new Uint8Array(12)
    bytes.set([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])
    assert.equal(validateWebpHeader(bytes), true)
  })

  it("rejects PNG signature mislabeled as webp", () => {
    const bytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0,
    ])
    assert.equal(validateWebpHeader(bytes), false)
    assert.equal(validatePngHeader(bytes), true)
  })
})
