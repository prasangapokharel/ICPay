import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Blob "mo:core/Blob";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Config "../config/Config";

module {

  public func isWebpType(contentType: Text) : Bool {
    contentType == "image/webp"
  };

  public func isDocumentType(contentType: Text) : Bool {
    contentType == "text/plain" or
    contentType == "text/x-python" or
    contentType == "application/x-python-code" or
    contentType == "application/zip" or
    contentType == "application/x-zip-compressed"
  };

  public func pathExtension(path: Text) : Text {
    let parts = Iter.toArray(Text.split(path, #char '.'));
    if (parts.size() <= 1) return "";
    Text.toLower(parts[parts.size() - 1])
  };

  public func validateWebpHeader(data: Blob) : Bool {
    if (data.size() < 12) return false;
    var b0 : Nat8 = 0;
    var b1 : Nat8 = 0;
    var b2 : Nat8 = 0;
    var b3 : Nat8 = 0;
    var b8 : Nat8 = 0;
    var b9 : Nat8 = 0;
    var b10 : Nat8 = 0;
    var b11 : Nat8 = 0;
    var idx = 0;
    label header for (b in data.values()) {
      switch (idx) {
        case (0) { b0 := b };
        case (1) { b1 := b };
        case (2) { b2 := b };
        case (3) { b3 := b };
        case (8) { b8 := b };
        case (9) { b9 := b };
        case (10) { b10 := b };
        case (11) { b11 := b };
        case (_) {};
      };
      idx += 1;
      if (idx >= 12) break header;
    };
    b0 == 0x52 and b1 == 0x49 and b2 == 0x46 and b3 == 0x46 and
    b8 == 0x57 and b9 == 0x45 and b10 == 0x42 and b11 == 0x50
  };

  public func normalizeDocumentType(contentType: Text, path: Text) : ?Text {
    let ext = pathExtension(path);
    if (contentType == "text/plain" or contentType == "text/x-python" or ext == "txt") {
      return ?"text/plain"
    };
    if (contentType == "text/x-python" or contentType == "application/x-python-code" or ext == "py") {
      return ?"text/x-python"
    };
    if (
      contentType == "application/zip" or
      contentType == "application/x-zip-compressed" or
      ext == "zip"
    ) {
      return ?"application/zip"
    };
    null
  };

  // Images are stored as WebP only (app converts before upload).
  public func normalizeUpload(path: Text, contentType: Text, data: Blob) : ?Text {
    if (validateWebpHeader(data)) {
      return ?"image/webp"
    };
    normalizeDocumentType(contentType, path)
  };

  public func validateZipHeader(data: Blob) : Bool {
    if (data.size() < 4) return false;
    var b0 : Nat8 = 0;
    var b1 : Nat8 = 0;
    var b2 : Nat8 = 0;
    var b3 : Nat8 = 0;
    var idx = 0;
    for (b in data.values()) {
      switch (idx) {
        case (0) { b0 := b };
        case (1) { b1 := b };
        case (2) { b2 := b };
        case (3) { b3 := b };
        case (_) {};
      };
      idx += 1;
      if (idx >= 4) break;
    };
    b0 == 0x50 and b1 == 0x4B and (b2 == 0x03 or b2 == 0x05 or b2 == 0x07) and (b3 == 0x04 or b3 == 0x06 or b3 == 0x08)
  };

  public func validateUploadContent(normalizedType: Text, data: Blob) : Bool {
    if (normalizedType == "image/webp") {
      return validateWebpHeader(data)
    };
    if (normalizedType == "application/zip") {
      return validateZipHeader(data)
    };
    if (normalizedType == "text/plain" or normalizedType == "text/x-python") {
      return data.size() > 0
    };
    false
  };

  public func validateFileSize(size: Nat) : Bool {
    size <= Config.BUCKET_MAX_FILE_BYTES
  };

};
