import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  buildFileAcceptList,
  isAllowedUpload,
  isUploadCandidate,
  normalizeUploadFile,
  pathExtension,
} from "./allowed-files"

const MAX = 10_000_000

function mockFile(name: string, type: string, size = 4): File {
  return new File([new Uint8Array(size).fill(0xab)], name, { type })
}

describe("buildFileAcceptList", () => {
  it("returns */* for Safari/iOS picker compatibility", () => {
    assert.equal(buildFileAcceptList(), "*/*")
  })
})

describe("isUploadCandidate — no MIME blocking", () => {
  const acceptCases: { label: string; file: File }[] = [
    { label: "photo.jpg + image/jpeg", file: mockFile("photo.jpg", "image/jpeg") },
    { label: "photo.heic + image/heic", file: mockFile("photo.heic", "image/heic") },
    { label: "photo + image/heic (no extension)", file: mockFile("photo", "image/heic") },
    { label: "photo.jpg + image/heic (Safari mismatch)", file: mockFile("photo.jpg", "image/heic") },
    { label: "photo.webp + video/webp mislabel", file: mockFile("photo.webp", "video/webp") },
    { label: "video + video/mp4 (no extension)", file: mockFile("video", "video/mp4") },
    { label: "setup.exe unknown type", file: mockFile("setup.exe", "application/x-msdownload") },
    { label: "doc without extension", file: mockFile("doc", "application/pdf") },
  ]

  for (const { label, file } of acceptCases) {
    it(`accepts ${label}`, () => {
      assert.equal(isUploadCandidate(file, MAX), true, label)
      assert.equal(isAllowedUpload(file, MAX), true, label)
    })
  }

  it("rejects video.mp4 by extension", () => {
    const file = mockFile("video.mp4", "video/mp4")
    assert.equal(isUploadCandidate(file, MAX), false)
  })

  it("rejects clip.mov even with image MIME", () => {
    assert.equal(isUploadCandidate(mockFile("clip.mov", "image/jpeg"), MAX), false)
  })
})

describe("isUploadCandidate — size", () => {
  it("rejects empty files", () => {
    assert.equal(isUploadCandidate(mockFile("photo.jpg", "image/jpeg", 0), MAX), false)
  })

  it("rejects files over max bytes", () => {
    assert.equal(isUploadCandidate(mockFile("photo.jpg", "image/jpeg", MAX + 1), MAX), false)
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
