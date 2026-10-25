#!/usr/bin/env bash
# 为已有标签创建 GitHub Release。已有说明时不覆盖。不创建、不移动 git 标签。
set -euo pipefail

: "${TAG:?}"
: "${VERSION:?}"
: "${WEB_IMAGE:?}"
: "${ENGINE_IMAGE:?}"
: "${GITHUB_SHA:?}"
: "${GH_TOKEN:?}"

LOCAL="$(git rev-parse "refs/tags/${TAG}^{commit}")"
if [[ "$LOCAL" != "$GITHUB_SHA" ]]; then
  echo "拒绝发布：标签 ${TAG} 指向 ${LOCAL}，本次提交是 ${GITHUB_SHA}。"
  exit 1
fi

if gh release view "$TAG" >/dev/null 2>&1; then
  echo "GitHub Release ${TAG} 已存在，保留原来的说明。"
  exit 0
fi

NOTES="$(mktemp)"
trap 'rm -f "$NOTES"' EXIT
sed \
  -e "s|__VERSION__|${VERSION}|g" \
  -e "s|__WEB_IMAGE__|${WEB_IMAGE}|g" \
  -e "s|__ENGINE_IMAGE__|${ENGINE_IMAGE}|g" \
  .github/scripts/release-notes.md > "$NOTES"
if grep -E -q '__VERSION__|__WEB_IMAGE__|__ENGINE_IMAGE__' "$NOTES"; then
  echo "说明模板没有替换完。"
  exit 1
fi

attempt=1
while [[ "$attempt" -le 5 ]]; do
  if gh release create "$TAG" --target "$GITHUB_SHA" --title "$TAG" --notes-file "$NOTES"; then
    echo "已创建 GitHub Release ${TAG}。"
    exit 0
  fi
  if gh release view "$TAG" >/dev/null 2>&1; then
    echo "GitHub Release ${TAG} 已由另一个任务创建，保留它的说明。"
    exit 0
  fi
  sleep $((attempt * 2))
  attempt=$((attempt + 1))
done

echo "无法创建 GitHub Release ${TAG}。"
exit 1
