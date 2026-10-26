#!/usr/bin/env bash
set -euo pipefail

case "$(uname -m)" in
  arm64|aarch64) target="arm64" ;;
  x86_64|amd64) target="x64" ;;
  *)
    echo "Unsupported architecture: $(uname -m)" >&2
    exit 1
    ;;
esac

cd "$(dirname "$0")/../apps/desktop"
exec npx electron-builder --mac dmg zip --"$target"
