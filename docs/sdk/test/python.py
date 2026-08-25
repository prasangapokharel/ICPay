#!/usr/bin/env python3
import os
import sys
import time
from pathlib import Path

from icpay_bucket import BucketClient

ROOT = Path(__file__).resolve().parent
api_key = os.environ.get("BUCKET_API_KEY")
bucket_id = os.environ.get("BUCKET_ID", "ocp")

if not api_key:
    print("Set BUCKET_API_KEY", file=sys.stderr)
    sys.exit(1)

client = BucketClient(api_key=api_key)
data = (ROOT / "file.txt").read_bytes()
base = f"/sdk-test-{int(time.time())}"
path = f"{base}/file.txt"
copy_path = f"{base}/file-copy.txt"
moved_path = f"{base}/file-moved.txt"

passed = failed = 0


def ok(name: str, detail: str = "") -> None:
    global passed
    passed += 1
    print(f"✓ {name}" + (f" — {detail}" if detail else ""))


def fail(name: str, err: str) -> None:
    global failed
    failed += 1
    print(f"✗ {name} — {err}", file=sys.stderr)


def unwrap(res: dict, label: str):
    if "err" in res:
        raise RuntimeError(f"{label}: {res['err']}")
    return res["ok"]


def run(name: str, fn) -> None:
    try:
        ok(name, fn() or "")
    except Exception as e:
        fail(name, str(e))


def preflight() -> None:
    probe = client.upload_file(
        bucket_id=bucket_id,
        path="/.sdk-preflight",
        data=b"",
        content_type="text/plain",
    )
    if probe.get("err") == "Bucket not found":
        print(
            f'\nBucket "{bucket_id}" not found on mainnet.\n'
            "Set BUCKET_ID to the name shown in ICPay → Bucket (e.g. my-app).\n",
            file=sys.stderr,
        )
        sys.exit(1)
    if "ok" in probe:
        client.delete_file(bucket_id, "/.sdk-preflight")


preflight()

run("getBucketCycleStatus", lambda: unwrap(client.get_bucket_cycle_status(), "getBucketCycleStatus") or "platform ok")
run("getBucketPrice", lambda: f"{unwrap(client.get_bucket_price(1), 'getBucketPrice')} e8s for 1 GB")
run("uploadFile", lambda: unwrap(client.upload_file(bucket_id=bucket_id, path=path, data=data, content_type="text/plain"), "uploadFile") or path)
run("fileExists", lambda: "true" if unwrap(client.file_exists(bucket_id, path), "fileExists") else (_ for _ in ()).throw(RuntimeError("expected true")))
run("getFile", lambda: unwrap(client.get_file(bucket_id, path), "getFile")["name"])
run("downloadFile", lambda: f"{len(unwrap(client.download_file(bucket_id, path), 'downloadFile'))} bytes")
run("listFiles", lambda: f"{len(unwrap(client.list_files(bucket_id, 0, 20), 'listFiles')['items'])} items")
run("listFolder", lambda: f"{len(unwrap(client.list_folder(bucket_id, base, 0, 20), 'listFolder')['items'])} in folder")
run("searchFiles", lambda: f"{len(unwrap(client.search_files(bucket_id, 'file.txt', 0, 20), 'searchFiles')['items'])} matches")
run("getFileMetadata", lambda: unwrap(client.get_file_metadata(bucket_id, path), "getFileMetadata") or "read")
run("setFileMetadata", lambda: unwrap(client.set_file_metadata(bucket_id, path, '{"sdk":"test"}'), "setFileMetadata") or "set")
run("setFileTags", lambda: unwrap(client.set_file_tags(bucket_id, path, ["sdk", "test"]), "setFileTags") or "tagged")
run("addFileTags", lambda: unwrap(client.add_file_tags(bucket_id, path, ["v1"]), "addFileTags") or "added")
run("removeFileTags", lambda: unwrap(client.remove_file_tags(bucket_id, path, ["v1"]), "removeFileTags") or "removed")
run("updateFile", lambda: unwrap(client.update_file(bucket_id, path, metadata='{"sdk":"updated"}'), "updateFile") or "updated")
run("copyFile", lambda: unwrap(client.copy_file(bucket_id, path, copy_path), "copyFile") or copy_path)
run("moveFile", lambda: unwrap(client.move_file(bucket_id, copy_path, moved_path), "moveFile") or moved_path)
run("getPublicFileUrl", lambda: unwrap(client.get_public_file_url(bucket_id, path), "getPublicFileUrl")[:60] + "…")
run("publicUrl", lambda: client.public_url(bucket_id, path)[:60] + "…")

def bulk_copy():
    dst = f"{base}/bulk-copy.txt"
    unwrap(client.bulk_copy_files(bucket_id, [{"source": path, "destination": dst}]), "bulkCopyFiles")
    client.delete_file(bucket_id, dst)
    return "1 copied"

run("bulkCopyFiles", bulk_copy)

def bulk_move():
    src = f"{base}/bulk-src.txt"
    dst = f"{base}/bulk-dst.txt"
    client.upload_file(bucket_id=bucket_id, path=src, data=data, content_type="text/plain")
    unwrap(client.bulk_move_files(bucket_id, [{"source": src, "destination": dst}]), "bulkMoveFiles")
    client.delete_file(bucket_id, dst)
    return "1 moved"

run("bulkMoveFiles", bulk_move)
run("deleteFile (moved copy)", lambda: unwrap(client.delete_file(bucket_id, moved_path), "deleteFile") or moved_path)
run("bulkDeleteFiles", lambda: unwrap(client.bulk_delete_files(bucket_id, [path]), "bulkDeleteFiles") or path)

print(f"\nDone: {passed} passed, {failed} failed")
sys.exit(1 if failed else 0)
