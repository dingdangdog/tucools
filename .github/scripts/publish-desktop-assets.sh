#!/usr/bin/env bash
# 收集一个平台的安装包，写独立校验文件，并上传到已有标签的 Release。
set -euo pipefail

PLATFORM="${1:-}"
case "$PLATFORM" in
  windows|macos|linux) ;;
  *)
    echo "用法：$0 windows|macos|linux"
    exit 1
    ;;
esac

SRC="apps/desktop/release"
if [[ ! -d "$SRC" ]]; then
  echo "没有找到 ${SRC}"
  exit 1
fi

DEST="$(mktemp -d)"
trap 'rm -rf "$DEST"' EXIT
shopt -s nullglob

case "$PLATFORM" in
  windows) patterns=('*.exe' '*.blockmap') ;;
  macos) patterns=('*.dmg' '*.zip' '*.blockmap') ;;
  linux) patterns=('*.AppImage' '*.deb' '*.blockmap') ;;
esac

for pattern in "${patterns[@]}"; do
  for file in "$SRC"/$pattern; do
    [[ -f "$file" ]] || continue
    name="$(basename "$file")"
    case "$name" in
      latest*.yml|builder-debug.yml|builder-effective-config.yaml) continue ;;
    esac
    cp -f "$file" "$DEST/$name"
  done
done

missing=""
case "$PLATFORM" in
  windows)
    exe=( "$DEST"/*.exe )
    [[ ${#exe[@]} -ge 1 ]] || missing="exe"
    ;;
  macos)
    dmg=( "$DEST"/*.dmg )
    [[ ${#dmg[@]} -ge 1 ]] || missing="dmg"
    ;;
  linux)
    app=( "$DEST"/*.AppImage )
    deb=( "$DEST"/*.deb )
    [[ ${#app[@]} -ge 1 && ${#deb[@]} -ge 1 ]] || missing="AppImage 或 deb"
    ;;
esac
if [[ -n "$missing" ]]; then
  echo "没有生成 ${missing}。构建目录："
  ls -la "$SRC"
  exit 1
fi

SUMS="$(mktemp)"
(
  cd "$DEST"
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum -- *
  else
    shasum -a 256 -- *
  fi
) > "$SUMS"
mv "$SUMS" "$DEST/SHA256SUMS-${PLATFORM}.txt"

bash .github/scripts/ensure-release.sh
gh release upload "$TAG" "$DEST"/* --clobber

if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
  {
    echo "### ${PLATFORM}"
    echo
    echo '```'
    cat "$DEST/SHA256SUMS-${PLATFORM}.txt"
    echo '```'
    echo
  } >> "$GITHUB_STEP_SUMMARY"
fi
