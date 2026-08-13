import Debug "mo:core/Debug";
import Blob "mo:core/Blob";
import Nat "mo:core/Nat";
import FileValidator "../../src/utils/FileValidator";
import Fixtures "../bucket/Fixtures";

func sampleBlob(ext: Text) : Blob {
  switch (ext) {
    case ("webp") { Fixtures.webp() };
    case ("png") { Fixtures.png() };
    case ("jpg") { Blob.fromArray([0xFF, 0xD8, 0xFF, 0x00]) };
    case ("jpeg") { Blob.fromArray([0xFF, 0xD8, 0xFF, 0x00]) };
    case ("gif") { Blob.fromArray([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]) };
    case ("zip") { Blob.fromArray([0x50, 0x4B, 0x03, 0x04, 0x00]) };
    case ("gz") { Blob.fromArray([0x1F, 0x8B, 0x08]) };
    case ("pdf") { Blob.fromArray([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31]) };
    case (_) { Blob.fromArray([0x41]) };
  }
};

var catalogOk : Nat = 0;
for (ext in FileValidator.allowedExtensions().vals()) {
  switch (FileValidator.mimeFromExtension(ext)) {
    case (null) { assert false; Debug.print("FAIL: no MIME for allowed ext ." # ext) };
    case (?expected) {
      let path = "/file." # ext;
      switch (FileValidator.normalizeUpload(path, "", sampleBlob(ext))) {
        case (null) { assert false; Debug.print("FAIL: normalize rejected ." # ext) };
        case (?mime) {
          assert mime == expected;
          catalogOk += 1;
        };
      };
    };
  };
};
Debug.print("PASS: MIME catalog — " # Nat.toText(catalogOk) # " allowed extensions");

for (ext in FileValidator.blockedExtensions().vals()) {
  assert not FileValidator.isAllowedExtension(ext);
  assert FileValidator.mimeFromExtension(ext) == null;
};
Debug.print("PASS: blocked video and executable extensions rejected");

Debug.print("ALL FILE VALIDATOR TESTS PASSED");
