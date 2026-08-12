import Debug "mo:core/Debug";
import Blob "mo:core/Blob";
import FileValidator "../../src/utils/FileValidator";
import Fixtures "../bucket/Fixtures";

let fake = Blob.fromArray([0x00, 0x00, 0x00, 0x00]);

assert FileValidator.isWebpType("image/webp");
assert not FileValidator.isWebpType("image/png");
assert not FileValidator.isWebpType("image/svg+xml");
Debug.print("PASS: webp mime gate");

assert FileValidator.validateWebpHeader(Fixtures.webp());
assert not FileValidator.validateWebpHeader(Fixtures.png());
assert not FileValidator.validateWebpHeader(Fixtures.svg());
assert not FileValidator.validateWebpHeader(fake);
Debug.print("PASS: webp magic byte gate");

switch (FileValidator.normalizeUpload("/logo.webp", "image/webp", Fixtures.webp())) {
  case (?ct) {
    assert ct == "image/webp";
    Debug.print("PASS: webp normalize");
  };
  case (null) { assert false; Debug.print("FAIL: webp normalize") };
};

switch (FileValidator.normalizeUpload("/logo.png", "image/png", Fixtures.png())) {
  case (?_) { assert false; Debug.print("FAIL: png accepted") };
  case (null) { Debug.print("PASS: png rejected") };
};

switch (FileValidator.normalizeUpload("/icon.svg", "image/svg+xml", Fixtures.svg())) {
  case (?_) { assert false; Debug.print("FAIL: svg accepted") };
  case (null) { Debug.print("PASS: svg rejected") };
};

assert FileValidator.validateFileSize(1_000_000);
assert not FileValidator.validateFileSize(10_000_001);
Debug.print("PASS: size gate");

Debug.print("Bucket security validation tests done");
