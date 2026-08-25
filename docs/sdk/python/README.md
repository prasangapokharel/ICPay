# Python SDK

```bash
pip install icpay-bucket
```

## Setup

```python
import os
from icpay_bucket import BucketClient

client = BucketClient(api_key=os.environ["BUCKET_API_KEY"])
```

Pass `identity=` instead of `api_key=` for owner calls (create bucket, list buckets, API keys).

## Upload

```python
data = b"file content"

result = client.upload_file(
    bucket_id="my-app",
    path="/docs/file.txt",
    data=data,
    content_type="text/plain",
)

if "err" in result:
    print(result["err"])
else:
    print("Success uploaded:", result["ok"])
    print(client.public_url("my-app", "/docs/file.txt"))
```

## Download

```python
result = client.download_file("my-app", "/docs/file.txt")
if "ok" in result:
    print(result["ok"].decode())
```

## List & search

```python
client.list_files("my-app", page=0, page_size=50)
client.list_folder("my-app", "/docs", page=0, page_size=50)
client.search_files("my-app", "file.txt", page=0, page_size=20)
client.file_exists("my-app", "/docs/file.txt")
```

## Move, copy, delete

```python
client.copy_file("my-app", "/a.txt", "/b.txt")
client.move_file("my-app", "/b.txt", "/archive/b.txt")
client.delete_file("my-app", "/archive/b.txt")
```

## Responses

Methods return a dict with either `ok` or `err`:

```python
if "ok" in result:
    value = result["ok"]
else:
    error = result["err"]
```

## Run tests

```bash
cd ../test
export BUCKET_API_KEY=…
export BUCKET_ID=my-app
python3 python.py
```
