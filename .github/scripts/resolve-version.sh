#!/usr/bin/env bash
# 把本次填写的版本号变成业务标签。不查找仓库里已有的版本标签。
# 标签名是 web-vX.Y.Z、engine-vX.Y.Z 或 client-vX.Y.Z，由后续步骤写到当前提交。
set -euo pipefail

PRODUCT="${PRODUCT:?}"
case "$PRODUCT" in
  web|engine|client) ;;
  *)
    echo "业务只能是 web、engine 或 client。当前是：${PRODUCT}"
    exit 1
    ;;
esac

RAW="${INPUT_VERSION:-}"
if [[ "$RAW" == *$'\n'* || "$RAW" == *$'\r'* ]]; then
  echo "版本号不能换行。"
  exit 1
fi
RAW="${RAW#"${RAW%%[![:space:]]*}"}"
RAW="${RAW%"${RAW##*[![:space:]]}"}"
if [[ "$RAW" == "${PRODUCT}-v"* ]]; then
  RAW="${RAW#"${PRODUCT}-v"}"
elif [[ "$RAW" == "${PRODUCT}-"* ]]; then
  RAW="${RAW#"${PRODUCT}-"}"
fi
if [[ "$RAW" == v* ]]; then
  RAW="${RAW#v}"
fi

semver='^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$'
if [[ -z "$RAW" ]]; then
  echo "请填写版本号，例如 0.3.0。工作流会在当前提交上创建 ${PRODUCT}-v0.3.0。"
  exit 1
fi
if [[ ! "$RAW" =~ $semver ]]; then
  echo "版本号必须是主版本.次版本.修订号，例如 0.3.0。当前是：${RAW}"
  exit 1
fi

VERSION="$RAW"
TAG="${PRODUCT}-v${VERSION}"

owner="$(printf '%s' "${GITHUB_REPOSITORY_OWNER:?}" | tr '[:upper:]' '[:lower:]')"
if [[ ! "$owner" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
  echo "仓库所有者名称无法用作镜像名：${owner}"
  exit 1
fi

{
  echo "version=${VERSION}"
  echo "tag=${TAG}"
  echo "product=${PRODUCT}"
  echo "web_image=ghcr.io/${owner}/tucools-web"
  echo "engine_image=ghcr.io/${owner}/tucools-engine"
} >> "${GITHUB_OUTPUT:?}"

echo "业务 ${PRODUCT}，标签 ${TAG}，提交 ${GITHUB_SHA:-未设置}"
