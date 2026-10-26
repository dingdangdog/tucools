#!/usr/bin/env bash
# 决定镜像标签。auto：已有更高的版本标签时不移动 latest。
set -euo pipefail

: "${VERSION:?}"
: "${IMAGE:?}"
choice="${INPUT_LATEST:-auto}"
# GitHub 的运行表单会把未加引号的 yes/no 显示成 true/false。
case "$choice" in
  true|yes) choice=always ;;
  false|no) choice=never ;;
esac
case "$choice" in
  auto|always|never) ;;
  *)
    echo "latest 只能是 auto、always 或 never。当前是：${choice}"
    exit 1
    ;;
esac

mark=false
if [[ "$choice" == "always" ]]; then
  mark=true
elif [[ "$choice" == "auto" ]]; then
  mark=true
  tags="$(git ls-remote --tags origin 'refs/tags/v*')"
  while IFS=$'\t' read -r _ ref; do
    [[ -n "${ref:-}" ]] || continue
    name="${ref##*/}"
    name="${name%%^*}"
    if [[ ! "$name" =~ ^v(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$ ]]; then
      continue
    fi
    other="${name#v}"
    top="$(printf '%s\n%s\n' "$VERSION" "$other" | sort -V | tail -n1)"
    if [[ "$top" == "$other" && "$other" != "$VERSION" ]]; then
      mark=false
      echo "已有更高版本标签 v${other}，这次不移动 latest。"
      break
    fi
  done <<< "$tags"
fi

{
  echo "image=${IMAGE}"
  echo "mark_latest=${mark}"
  echo "tags<<EOF"
  echo "${IMAGE}:${VERSION}"
  if [[ "$mark" == "true" ]]; then
    echo "${IMAGE}:latest"
  fi
  echo "EOF"
} >> "${GITHUB_OUTPUT:?}"

echo "镜像 ${IMAGE}:${VERSION}，latest=${mark}"
