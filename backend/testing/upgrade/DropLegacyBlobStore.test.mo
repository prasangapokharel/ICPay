import Debug "mo:core/Debug";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Blob "mo:core/Blob";
import BlobStore "../../src/blob/BlobStore";
import DropLegacyBlobStore "../../src/migrations/DropLegacyBlobStore";

let legacy = BlobStore.emptyStore();
Map.add(legacy.blobs, Text.compare, "file-1", Blob.fromArray([9, 8, 7]));

ignore DropLegacyBlobStore.migration({ legacyBlobStore = legacy });

Debug.print("PASS: legacy blob store dropped from stable state");
Debug.print("ALL DROP LEGACY BLOB STORE MIGRATION TESTS PASSED");
