#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
BUNDLE="$ROOT/desktop/wallet/src-tauri/target/release/bundle"
LINUX_OUT="$ROOT/downloads/linux"
WIN_OUT="$ROOT/downloads/window"

mkdir -p "$LINUX_OUT" "$WIN_OUT"

shopt -s nullglob

for rpm in "$BUNDLE"/rpm/*.rpm; do
  cp -f "$rpm" "$LINUX_OUT/icpay-wallet-linux.rpm"
done

for deb in "$BUNDLE"/deb/*.deb; do
  cp -f "$deb" "$LINUX_OUT/icpay-wallet-linux.deb"
done

for exe in "$BUNDLE"/nsis/*.exe; do
  cp -f "$exe" "$WIN_OUT/icpay-wallet-setup.exe"
done

for exe in "$BUNDLE"/msi/*.exe "$BUNDLE"/msi/*.msi; do
  cp -f "$exe" "$WIN_OUT/"
done

echo "Staged Linux artifacts in $LINUX_OUT"
echo "Staged Windows artifacts in $WIN_OUT"
