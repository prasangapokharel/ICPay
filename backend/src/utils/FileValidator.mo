import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Blob "mo:core/Blob";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Array "mo:core/Array";
import Config "../config/Config";

module {

  private let BLOCKED : [Text] = [
    "mp4", "webm", "mov", "avi", "mkv", "m4v", "flv", "wmv", "mpeg", "mpg", "3gp",
  ];

  private let ALLOWED : [Text] = [
    "jpg", "jpeg", "png", "webp", "gif", "svg", "avif", "bmp", "ico", "tif", "tiff",
    "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "md", "csv", "rtf",
    "odt", "ods", "odp",
    "js", "ts", "tsx", "jsx", "go", "rs", "py", "java", "kt", "swift", "php", "rb",
    "cpp", "c", "h", "hpp", "cs", "dart", "sh", "sql", "html", "css", "scss", "json",
    "xml", "yaml", "yml", "toml",
    "zip", "tar", "gz", "bz2", "7z", "rar",
    "mp3", "wav", "ogg", "flac", "m4a", "aac",
    "ttf", "otf", "woff", "woff2",
    "bin", "dat", "wasm",
  ];

  public func pathExtension(path: Text) : Text {
    let parts = Iter.toArray(Text.split(path, #char '.'));
    if (parts.size() <= 1) return "";
    Text.toLower(parts[parts.size() - 1])
  };

  private func inList(ext: Text, list: [Text]) : Bool {
    for (item in list.vals()) {
      if (item == ext) return true;
    };
    false
  };

  public func isBlockedExtension(ext: Text) : Bool {
    inList(ext, BLOCKED)
  };

  public func isAllowedExtension(ext: Text) : Bool {
    ext.size() > 0 and not isBlockedExtension(ext) and inList(ext, ALLOWED)
  };

  public func mimeFromExtension(ext: Text) : ?Text {
    if (not isAllowedExtension(ext)) return null;
    switch (ext) {
      case ("jpg") { ?"image/jpeg" };
      case ("jpeg") { ?"image/jpeg" };
      case ("png") { ?"image/png" };
      case ("webp") { ?"image/webp" };
      case ("gif") { ?"image/gif" };
      case ("svg") { ?"image/svg+xml" };
      case ("avif") { ?"image/avif" };
      case ("bmp") { ?"image/bmp" };
      case ("ico") { ?"image/x-icon" };
      case ("tif") { ?"image/tiff" };
      case ("tiff") { ?"image/tiff" };
      case ("pdf") { ?"application/pdf" };
      case ("doc") { ?"application/msword" };
      case ("docx") { ?"application/vnd.openxmlformats-officedocument.wordprocessingml.document" };
      case ("xls") { ?"application/vnd.ms-excel" };
      case ("xlsx") { ?"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" };
      case ("ppt") { ?"application/vnd.ms-powerpoint" };
      case ("pptx") { ?"application/vnd.openxmlformats-officedocument.presentationml.presentation" };
      case ("txt") { ?"text/plain" };
      case ("md") { ?"text/markdown" };
      case ("csv") { ?"text/csv" };
      case ("rtf") { ?"application/rtf" };
      case ("odt") { ?"application/vnd.oasis.opendocument.text" };
      case ("ods") { ?"application/vnd.oasis.opendocument.spreadsheet" };
      case ("odp") { ?"application/vnd.oasis.opendocument.presentation" };
      case ("js") { ?"text/javascript" };
      case ("ts") { ?"text/typescript" };
      case ("tsx") { ?"text/typescript" };
      case ("jsx") { ?"text/javascript" };
      case ("go") { ?"text/x-go" };
      case ("rs") { ?"text/x-rust" };
      case ("py") { ?"text/x-python" };
      case ("java") { ?"text/x-java" };
      case ("kt") { ?"text/x-kotlin" };
      case ("swift") { ?"text/x-swift" };
      case ("php") { ?"application/x-php" };
      case ("rb") { ?"application/x-ruby" };
      case ("cpp") { ?"text/x-c++src" };
      case ("c") { ?"text/x-c" };
      case ("h") { ?"text/x-c" };
      case ("hpp") { ?"text/x-c++src" };
      case ("cs") { ?"text/x-csharp" };
      case ("dart") { ?"application/dart" };
      case ("sh") { ?"application/x-sh" };
      case ("sql") { ?"application/sql" };
      case ("html") { ?"text/html" };
      case ("css") { ?"text/css" };
      case ("scss") { ?"text/x-scss" };
      case ("json") { ?"application/json" };
      case ("xml") { ?"application/xml" };
      case ("yaml") { ?"text/yaml" };
      case ("yml") { ?"text/yaml" };
      case ("toml") { ?"application/toml" };
      case ("zip") { ?"application/zip" };
      case ("tar") { ?"application/x-tar" };
      case ("gz") { ?"application/gzip" };
      case ("bz2") { ?"application/x-bzip2" };
      case ("7z") { ?"application/x-7z-compressed" };
      case ("rar") { ?"application/vnd.rar" };
      case ("mp3") { ?"audio/mpeg" };
      case ("wav") { ?"audio/wav" };
      case ("ogg") { ?"audio/ogg" };
      case ("flac") { ?"audio/flac" };
      case ("m4a") { ?"audio/mp4" };
      case ("aac") { ?"audio/aac" };
      case ("ttf") { ?"font/ttf" };
      case ("otf") { ?"font/otf" };
      case ("woff") { ?"font/woff" };
      case ("woff2") { ?"font/woff2" };
      case ("bin") { ?"application/octet-stream" };
      case ("dat") { ?"application/octet-stream" };
      case ("wasm") { ?"application/wasm" };
      case (_) { ?"application/octet-stream" };
    }
  };

  public func validateWebpHeader(data: Blob) : Bool {
    if (data.size() < 12) return false;
    let bytes = Blob.toArray(data);
    bytes.size() >= 12 and
    bytes[0] == 0x52 and bytes[1] == 0x49 and bytes[2] == 0x46 and bytes[3] == 0x46 and
    bytes[8] == 0x57 and bytes[9] == 0x45 and bytes[10] == 0x42 and bytes[11] == 0x50
  };

  public func validatePngHeader(data: Blob) : Bool {
    if (data.size() < 8) return false;
    let bytes = Blob.toArray(data);
    bytes.size() >= 8 and
    bytes[0] == 0x89 and bytes[1] == 0x50 and bytes[2] == 0x4E and bytes[3] == 0x47 and
    bytes[4] == 0x0D and bytes[5] == 0x0A and bytes[6] == 0x1A and bytes[7] == 0x0A
  };

  public func validateJpegHeader(data: Blob) : Bool {
    if (data.size() < 3) return false;
    let bytes = Blob.toArray(data);
    bytes.size() >= 3 and bytes[0] == 0xFF and bytes[1] == 0xD8 and bytes[2] == 0xFF
  };

  public func validateGifHeader(data: Blob) : Bool {
    if (data.size() < 6) return false;
    let bytes = Blob.toArray(data);
    (bytes[0] == 0x47 and bytes[1] == 0x49 and bytes[2] == 0x46) and
    (bytes[3] == 0x38 and (bytes[4] == 0x37 or bytes[4] == 0x39) and bytes[5] == 0x61)
  };

  public func validateZipHeader(data: Blob) : Bool {
    if (data.size() < 4) return false;
    let bytes = Blob.toArray(data);
    bytes[0] == 0x50 and bytes[1] == 0x4B and
    (bytes[2] == 0x03 or bytes[2] == 0x05 or bytes[2] == 0x07) and
    (bytes[3] == 0x04 or bytes[3] == 0x06 or bytes[3] == 0x08)
  };

  public func validateGzipHeader(data: Blob) : Bool {
    if (data.size() < 2) return false;
    let bytes = Blob.toArray(data);
    bytes[0] == 0x1F and bytes[1] == 0x8B
  };

  public func validatePdfHeader(data: Blob) : Bool {
    if (data.size() < 5) return false;
    let bytes = Blob.toArray(data);
    bytes[0] == 0x25 and bytes[1] == 0x50 and bytes[2] == 0x44 and bytes[3] == 0x46 and bytes[4] == 0x2D
  };

  public func validateWasmHeader(data: Blob) : Bool {
    if (data.size() < 4) return false;
    let bytes = Blob.toArray(data);
    bytes[0] == 0x00 and bytes[1] == 0x61 and bytes[2] == 0x73 and bytes[3] == 0x6D
  };

  public func validatePathExtension(path: Text) : Bool {
    isAllowedExtension(pathExtension(path))
  };

  public func normalizeUpload(path: Text, _contentType: Text, data: Blob) : ?Text {
    let ext = pathExtension(path);
    if (isBlockedExtension(ext)) return null;
    switch (mimeFromExtension(ext)) {
      case (null) null;
      case (?mime) {
        if (validateUploadContent(ext, mime, data)) { ?mime } else { null }
      };
    }
  };

  public func validateUploadContent(ext: Text, _normalizedType: Text, data: Blob) : Bool {
    if (data.size() == 0) return false;
    switch (ext) {
      case ("webp") { validateWebpHeader(data) };
      case ("png") { validatePngHeader(data) };
      case ("jpg") { validateJpegHeader(data) };
      case ("jpeg") { validateJpegHeader(data) };
      case ("gif") { validateGifHeader(data) };
      case ("zip") { validateZipHeader(data) };
      case ("gz") { validateGzipHeader(data) };
      case ("pdf") { validatePdfHeader(data) };
      case ("wasm") { validateWasmHeader(data) };
      case (_) {
        // Text, code, audio, fonts, office docs — extension allow-list is the gate.
        data.size() > 0
      };
    }
  };

  public func validateFileSize(size: Nat) : Bool {
    size <= Config.BUCKET_MAX_FILE_BYTES
  };

};
