import Debug "mo:core/Debug";
import Blob "mo:core/Blob";
import FileValidator "../../src/utils/FileValidator";
import Fixtures "../bucket/Fixtures";

let fake = Blob.fromArray([0x00, 0x00, 0x00, 0x00]);

assert FileValidator.validateWebpHeader(Fixtures.webp());
assert FileValidator.validatePngHeader(Fixtures.png());
assert not FileValidator.validateWebpHeader(Fixtures.png());
Debug.print("PASS: image magic byte gates");

switch (FileValidator.normalizeUpload("/logo.webp", "image/webp", Fixtures.webp())) {
  case (?ct) {
    assert ct == "image/webp";
    Debug.print("PASS: webp normalize");
  };
  case (null) { assert false; Debug.print("FAIL: webp normalize") };
};

switch (FileValidator.normalizeUpload("/screenshot.png", "image/png", Fixtures.png())) {
  case (?ct) {
    assert ct == "image/png";
    Debug.print("PASS: png normalize");
  };
  case (null) { assert false; Debug.print("FAIL: png normalize") };
};

switch (FileValidator.normalizeUpload("/clip.mp4", "video/mp4", fake)) {
  case (?_) { assert false; Debug.print("FAIL: mp4 accepted") };
  case (null) { Debug.print("PASS: mp4 blocked") };
};

switch (FileValidator.normalizeUpload("/notes.txt", "text/plain", Blob.fromArray([0x68, 0x69]))) {
  case (?ct) {
    assert ct == "text/plain";
    Debug.print("PASS: txt normalize");
  };
  case (null) { assert false; Debug.print("FAIL: txt normalize") };
};

assert FileValidator.validateFileSize(10_000_000);
assert not FileValidator.validateFileSize(10_000_001);
Debug.print("PASS: size gate 10 MB");

Debug.print("Bucket security validation tests done");
