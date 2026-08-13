import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  normalizeUploadFile,
  pathExtension,
} from "./allowed-files"
import {
  buildUploadPath,
  replacePathExtension,
  sanitizeUploadFilename,
  uploadPathForFile,
} from "./upload-path"
import { shouldConvertRasterToWebp, RASTER_TO_WEBP, RASTER_SKIP } from "./raster-formats"
import { uploadValidationError } from "./upload-validate"

const MAX = 10_000_000

function mockFile(name: string, type: string, size = 1024): File {
  return new File([new Uint8Array(size).fill(0xab)], name, { type })
}

describe("shouldConvertRasterToWebp", () => {
  for (const ext of RASTER_TO_WEBP) {
    it(`converts .${ext}`, () => {
      assert.equal(
        shouldConvertRasterToWebp(mockFile(`photo.${ext}`, `image/${ext}`)),
        true
      )
    })
  }

  for (const ext of RASTER_SKIP) {
    it(`skips .${ext}`, () => {
      assert.equal(
        shouldConvertRasterToWebp(mockFile(`asset.${ext}`, `image/${ext}`)),
        false
      )
    })
  }

  it("converts SVG to WebP pipeline", () => {
    assert.equal(
      shouldConvertRasterToWebp(mockFile("icon.svg", "image/svg+xml")),
      true
    )
  })

  it("converts HEIC by MIME when extension is wrong", () => {
    assert.equal(
      shouldConvertRasterToWebp(mockFile("IMG_7301.jpg", "image/heic")),
      true
    )
  })

  it("skips PDF", () => {
    assert.equal(
      shouldConvertRasterToWebp(mockFile("doc.pdf", "application/pdf")),
      false
    )
  })

  it("converts SVG by MIME when extension is missing", () => {
    assert.equal(
      shouldConvertRasterToWebp(mockFile("icon", "image/svg+xml")),
      true
    )
  })

  it("skips ZIP even when mislabeled as image", () => {
    assert.equal(
      shouldConvertRasterToWebp(mockFile("archive.zip", "image/png")),
      false
    )
  })

  it("rejects video MIME", () => {
    assert.equal(
      shouldConvertRasterToWebp(mockFile("clip.mp4", "video/mp4")),
      false
    )
  })

  it("still converts .webp mislabeled as video/webp", () => {
    assert.equal(
      shouldConvertRasterToWebp(mockFile("photo.webp", "video/webp")),
      true
    )
  })
})

describe("upload path for prepared files", () => {
  it("uses sanitized original name", () => {
    assert.equal(uploadPathForFile(mockFile("My Photo.JPG", "image/jpeg")), "/my_photo.jpg")
  })

  it("buildUploadPath swaps to .webp for compressed rasters", () => {
    const normalized = normalizeUploadFile(mockFile("banner.PNG", "image/png"))
    assert.equal(buildUploadPath(normalized, true), "/banner.webp")
    assert.equal(buildUploadPath(normalized, false), "/banner.png")
  })

  it("HEIC iOS fix then webp path", () => {
    const normalized = normalizeUploadFile(mockFile("photo", "image/heic"))
    assert.equal(pathExtension(normalized.name), "heic")
    assert.equal(buildUploadPath(normalized, true), "/photo.webp")
  })

  it("non-image keeps original extension", () => {
    assert.equal(buildUploadPath(mockFile("readme.txt", "text/plain"), false), "/readme.txt")
  })

  it("replacePathExtension handles paths without extension", () => {
    assert.equal(replacePathExtension("/photo", ".webp"), "/photo.webp")
  })
})

describe("uploadValidationError", () => {
  it("rejects empty files", () => {
    assert.equal(uploadValidationError(mockFile("x.txt", "text/plain", 0)), "size")
  })

  it("rejects oversize files", () => {
    assert.equal(uploadValidationError(mockFile("big.zip", "application/zip", MAX + 1)), "size")
  })

  it("rejects video extension only", () => {
    assert.equal(uploadValidationError(mockFile("clip.mp4", "video/mp4")), "video")
  })

  it("rejects html and js", () => {
    assert.equal(uploadValidationError(mockFile("page.html", "text/html")), "blocked")
    assert.equal(uploadValidationError(mockFile("app.js", "text/javascript")), "blocked")
  })

  it("allows svg for client-side WebP conversion", () => {
    assert.equal(uploadValidationError(mockFile("icon.svg", "image/svg+xml")), null)
  })

  it("accepts JPEG regardless of MIME", () => {
    assert.equal(uploadValidationError(mockFile("photo.jpg", "image/jpeg")), null)
  })

  it("accepts extensionless file (backend validates)", () => {
    assert.equal(uploadValidationError(mockFile("photo", "image/png")), null)
  })
})

describe("sanitizeUploadFilename", () => {
  it("preserves sanitized original filename", () => {
    assert.equal(sanitizeUploadFilename("My Photo.JPG"), "my_photo.jpg")
  })

  it("replaces unsafe characters", () => {
    assert.equal(sanitizeUploadFilename("report (final).pdf"), "report__final_.pdf")
  })
})
