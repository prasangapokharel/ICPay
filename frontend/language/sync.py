#!/usr/bin/env python3
"""Copy missing keys from en/common.json into every other locale."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).parent
CONFIG = ROOT / "config.ts"


def locale_codes() -> list[str]:
    text = CONFIG.read_text(encoding="utf-8")
    return re.findall(r'code:\s*"([a-z-]+)"', text)


def deep_merge(base: dict, target: dict) -> dict:
    for key, value in base.items():
        if key not in target:
            target[key] = value
        elif isinstance(value, dict) and isinstance(target[key], dict):
            deep_merge(value, target[key])
    return target


def main() -> None:
    en_path = ROOT / "en" / "common.json"
    en = json.loads(en_path.read_text(encoding="utf-8"))
    updated = 0

    for code in locale_codes():
        if code == "en":
            continue
        path = ROOT / code / "common.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        before = json.dumps(data, sort_keys=True)
        deep_merge(en, data)
        after = json.dumps(data, sort_keys=True)
        if before != after:
            path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            updated += 1
            print(f"{code}: synced missing keys")

    print(f"done — updated {updated} locale(s)")


if __name__ == "__main__":
    main()
