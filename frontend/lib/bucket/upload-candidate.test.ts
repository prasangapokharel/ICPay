import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  isAllowedUpload,
  isUploadCandidate,
  normalizeUploadFile,
  pathExtension,
} from "./allowed-files"

const MAX = 10_000_000

function mockFile(name: string, type: string, size = 4): File {
  return new File([new Uint8Array(size).fill(0xab)], name, { type })
}

describe("isUploadCandidate / isAllowedUpload — iOS Safari mocks", () => {
  const cases: { label: string; file: File; expected: boolean }[] = [
    {
      label: "photo.jpg + image/jpeg",
      file: mockFile("photo.jpg", "image/jpeg"),
      expected: true,
    },
    {
      label: "photo.heic + image/heic",
      file: mockFile("photo.heic", "image/heic"),
      expected: true,
    },
    {
      label: "photo + image/heic (no extension)",
      file: mockFile("photo", "image/heic"),
      expected: true,
    },
    {
      label: "photo.jpg + image/heic (Safari mismatch)",
      file: mockFile("photo.jpg", "image/heic"),
      expected: true,
    },
    {
      label: "video.mp4 + video/mp4",
      file: mockFile("video.mp4", "video/mp4"),
      expected: false,
    },
    {
      label: "video + video/mp4 (no extension)",
      file: mockFile("video", "video/mp4"),
      expected: false,
    },
  ]

  for (const { label, file, expected } of cases) {
    it(label, () => {
      assert.equal(isUploadCandidate(file, MAX), expected, "isUploadCandidate")
      assert.equal(isAllowedUpload(file, MAX), expected, "isAllowedUpload")
    })
  }
})

describe("isUploadCandidate — edge cases", () => {
  it("rejects empty files", () => {
    const file = mockFile("photo.jpg", "image/jpeg", 0)
    assert.equal(isUploadCandidate(file, MAX), false)
  })

  it("rejects files over max bytes", () => {
    const file = mockFile("photo.jpg", "image/jpeg", MAX + 1)
    assert.equal(isUploadCandidate(file, MAX), false)
  })

  it("rejects blocked extension even with image MIME", () => {
    const file = mockFile("clip.mov", "image/jpeg")
    assert.equal(isUploadCandidate(file, MAX), false)
  })

  it("accepts .webp when MIME is mislabeled video/webp", () => {
    const file = mockFile("photo.webp", "video/webp")
    assert.equal(isUploadCandidate(file, MAX), true)
  })

  it("accepts PDF by extension", () => {
    const file = mockFile("doc.pdf", "application/pdf")
    assert.equal(isUploadCandidate(file, MAX), true)
  })

  it("accepts PDF by MIME when extension missing", () => {
    const file = mockFile("doc", "application/pdf")
    assert.equal(isUploadCandidate(file, MAX), true)
  })

  it("rejects unknown non-image type", () => {
    const file = mockFile("setup.exe", "application/x-msdownload")
    assert.equal(isUploadCandidate(file, MAX), false)
  })
})

describe("normalizeUploadFile — iOS filename fixes", () => {
  it("adds .heic extension when MIME is image/heic and name has none", () => {
    const normalized = normalizeUploadFile(mockFile("photo", "image/heic"))
    assert.equal(pathExtension(normalized.name), "heic")
    assert.equal(normalized.type, "image/heic")
  })

  it("fixes extension when MIME is image/heic but name ends in .jpg", () => {
    const normalized = normalizeUploadFile(mockFile("IMG_7301.jpg", "image/heic"))
    assert.equal(pathExtension(normalized.name), "heic")
  })

  it("leaves valid jpeg names unchanged", () => {
    const normalized = normalizeUploadFile(mockFile("photo.jpg", "image/jpeg"))
    assert.equal(normalized.name, "photo.jpg")
    assert.equal(normalized.type, "image/jpeg")
  })
})
