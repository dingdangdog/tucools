#!/usr/bin/env bash
# 为当前业务标签创建独立的 GitHub Release。已有说明时不覆盖。
# 页面和引擎不占用仓库的 Latest。客户端在本业务没有更高版本时设为 Latest。
set -euo pipefail

: "${TAG:?}"
: "${VERSION:?}"
: "${PRODUCT:?}"
: "${GITHUB_SHA:?}"
: "${GH_TOKEN:?}"
: "${GITHUB_REPOSITORY:?}"

case "$PRODUCT" in
  web|engine|client) ;;
  *)
    echo "业务只能是 web、engine 或 client。当前是：${PRODUCT}"
    exit 1
    ;;
esac

if [[ "$TAG" != "${PRODUCT}-v${VERSION}" ]]; then
  echo "标签 ${TAG} 与 ${PRODUCT} ${VERSION} 不一致。"
  exit 1
fi

LOCAL="$(git rev-parse "refs/tags/${TAG}^{commit}")"
if [[ "$LOCAL" != "$GITHUB_SHA" ]]; then
  echo "拒绝发布：标签 ${TAG} 指向 ${LOCAL}，本次提交是 ${GITHUB_SHA}。"
  exit 1
fi

case "$PRODUCT" in
  web) TITLE="TuCools Web ${VERSION} · 页面镜像" ;;
  engine) TITLE="TuCools Engine ${VERSION} · 引擎镜像" ;;
  client) TITLE="TuCools Client ${VERSION} · 客户端安装包" ;;
esac

release_url="${GITHUB_SERVER_URL:-https://github.com}/${GITHUB_REPOSITORY}/releases/tag/${TAG}"
if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
  printf '%s\n\n' "- [${TITLE}](${release_url})" >> "$GITHUB_STEP_SUMMARY"
fi

if gh release view "$TAG" >/dev/null 2>&1; then
  echo "GitHub Release ${TAG} 已存在，保留原来的说明。"
  echo "${release_url}"
  exit 0
fi

notes_template=".github/scripts/release-notes-${PRODUCT}.md"
if [[ ! -f "$notes_template" ]]; then
  echo "没有找到说明模板 ${notes_template}"
  exit 1
fi

NOTES="$(mktemp)"
trap 'rm -f "$NOTES"' EXIT
case "$PRODUCT" in
  web)
    : "${WEB_IMAGE:?}"
    sed \
      -e "s|__VERSION__|${VERSION}|g" \
      -e "s|__WEB_IMAGE__|${WEB_IMAGE}|g" \
      "$notes_template" > "$NOTES"
    ;;
  engine)
    : "${ENGINE_IMAGE:?}"
    sed \
      -e "s|__VERSION__|${VERSION}|g" \
      -e "s|__ENGINE_IMAGE__|${ENGINE_IMAGE}|g" \
      "$notes_template" > "$NOTES"
    ;;
  client)
    sed \
      -e "s|__VERSION__|${VERSION}|g" \
      "$notes_template" > "$NOTES"
    ;;
esac
if grep -E -q '__VERSION__|__WEB_IMAGE__|__ENGINE_IMAGE__' "$NOTES"; then
  echo "说明模板没有替换完。"
  exit 1
fi

latest_flag="--latest=false"
if [[ "$PRODUCT" == "client" ]]; then
  higher="$(PREFIX="client-" VERSION="$VERSION" bash .github/scripts/higher-release.sh)"
  if [[ "$higher" != "true" && "$higher" != "false" ]]; then
    echo "无法判断客户端是否已有更高版本。"
    exit 1
  fi
  if [[ "$higher" == "false" ]]; then
    latest_flag="--latest"
  fi
fi

attempt=1
while [[ "$attempt" -le 5 ]]; do
  if gh release create "$TAG" --target "$GITHUB_SHA" --title "$TITLE" --notes-file "$NOTES" "$latest_flag"; then
    echo "已创建 GitHub Release：${TITLE}"
    echo "${release_url}"
    exit 0
  fi
  if gh release view "$TAG" >/dev/null 2>&1; then
    echo "GitHub Release ${TAG} 已由另一个任务创建，保留它的说明。"
    echo "${release_url}"
    exit 0
  fi
  sleep $((attempt * 2))
  attempt=$((attempt + 1))
done

echo "无法创建 GitHub Release ${TAG}。"
exit 1
