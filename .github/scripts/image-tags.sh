#!/usr/bin/env bash
# 决定镜像标签。auto：同一业务已有更高的 web-v 或 engine-v 时不移动 latest。
set -euo pipefail

: "${VERSION:?}"
: "${IMAGE:?}"
: "${KIND:?}"
case "$KIND" in
  web|engine) ;;
  *)
    echo "kind 只能是 web 或 engine。当前是：${KIND}"
    exit 1
    ;;
esac

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
  higher="$(PREFIX="${KIND}-" VERSION="$VERSION" bash .github/scripts/higher-release.sh)"
  if [[ "$higher" != "true" && "$higher" != "false" ]]; then
    echo "无法判断 ${KIND} 是否已有更高版本。"
    exit 1
  fi
  if [[ "$higher" == "false" ]]; then
    mark=true
  fi
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
