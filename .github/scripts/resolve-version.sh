#!/usr/bin/env bash
# 解析本次发布版本，并确认远程标签 vX.Y.Z 已经指向当前提交。
# 不会创建或移动标签。推送标签本身也不会触发构建。
set -euo pipefail

RAW="${INPUT_VERSION:-}"
if [[ "$RAW" == *$'\n'* || "$RAW" == *$'\r'* ]]; then
  echo "版本号不能换行。"
  exit 1
fi
RAW="${RAW#"${RAW%%[![:space:]]*}"}"
RAW="${RAW%"${RAW##*[![:space:]]}"}"
if [[ "$RAW" == v* ]]; then
  RAW="${RAW#v}"
fi

semver='^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$'
tag_re='^v(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$'

if [[ -z "$RAW" ]]; then
  if [[ "${GITHUB_REF_TYPE:-}" == "tag" && "${GITHUB_REF_NAME:-}" =~ $tag_re ]]; then
    TAG="${GITHUB_REF_NAME}"
    VERSION="${TAG#v}"
  else
    echo "从分支运行时必须填写版本号，例如 0.3.0。从 v0.3.0 标签运行时可以留空。"
    exit 1
  fi
else
  if [[ ! "$RAW" =~ $semver ]]; then
    echo "版本号必须是主版本.次版本.修订号，例如 0.3.0。当前是：${RAW}"
    exit 1
  fi
  VERSION="$RAW"
  TAG="v${VERSION}"
  if [[ "${GITHUB_REF_TYPE:-}" == "tag" && "${GITHUB_REF_NAME}" != "$TAG" ]]; then
    echo "所选标签是 ${GITHUB_REF_NAME}，与填写的版本 ${TAG} 不一致。"
    exit 1
  fi
fi

if ! git fetch --force origin "refs/tags/${TAG}:refs/tags/${TAG}"; then
  echo "远程没有标签 ${TAG}。请先推送这个标签。推送标签不会开始构建。"
  exit 1
fi

LOCAL="$(git rev-parse "refs/tags/${TAG}^{commit}")"
if [[ "$LOCAL" != "${GITHUB_SHA:?}" ]]; then
  echo "标签 ${TAG} 指向 ${LOCAL}，这次工作流的提交是 ${GITHUB_SHA}。"
  echo "请从该标签运行，或把标签改到这次提交之后再运行。工作流不会移动已有标签。"
  exit 1
fi

owner="$(printf '%s' "${GITHUB_REPOSITORY_OWNER:?}" | tr '[:upper:]' '[:lower:]')"
if [[ ! "$owner" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
  echo "仓库所有者名称无法用作镜像名：${owner}"
  exit 1
fi

{
  echo "version=${VERSION}"
  echo "tag=${TAG}"
  echo "web_image=ghcr.io/${owner}/tucools-web"
  echo "engine_image=ghcr.io/${owner}/tucools-engine"
} >> "${GITHUB_OUTPUT:?}"

echo "版本 ${TAG}，提交 ${GITHUB_SHA}"
