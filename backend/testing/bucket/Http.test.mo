import Debug "mo:core/Debug";
import CloudHttpService "../../src/services/CloudHttpService";

switch (CloudHttpService.parseCloudPath("/cloud/my-bucket/logo.png")) {
  case (null) { assert false; Debug.print("FAIL [HTTP]: parse simple path") };
  case (?p) {
    assert p.bucketSegment == "my-bucket";
    assert p.path == "/logo.png";
    Debug.print("PASS [HTTP]: parse simple path");
  };
};

switch (CloudHttpService.parseCloudPath("/cloud/id-1/nested/dir/file.webp")) {
  case (null) { assert false; Debug.print("FAIL [HTTP]: parse nested path") };
  case (?p) {
    assert p.bucketSegment == "id-1";
    assert p.path == "/nested/dir/file.webp";
    Debug.print("PASS [HTTP]: parse nested path");
  };
};

assert CloudHttpService.stripQuery("/cloud/a/b.png?id=6vbhm-nqaaa-aaaan-q6muq-cai")
  == "/cloud/a/b.png";
Debug.print("PASS [HTTP]: strip query id");

switch (CloudHttpService.parseCloudPath("/other/path")) {
  case (null) { Debug.print("PASS [HTTP]: reject non-cloud path") };
  case (?_) { assert false; Debug.print("FAIL [HTTP]: reject non-cloud path") };
};

switch (CloudHttpService.parseCloudPath("/cloud/")) {
  case (null) { Debug.print("PASS [HTTP]: reject empty bucket") };
  case (?_) { assert false; Debug.print("FAIL [HTTP]: reject empty bucket") };
};

Debug.print("Bucket HTTP parse tests done");
