#!/usr/bin/env bash
# 把业务标签打在当前提交上。标签已在这次提交时直接继续。
# 标签指向别的提交时失败，不移动它。
set -euo pipefail

: "${TAG:?}"
: "${GITHUB_SHA:?}"

tag_re='^(web|engine|client)-v(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$'
if [[ ! "$TAG" =~ $tag_re ]]; then
  echo "拒绝创建标签 ${TAG}。名称必须是 web-vX.Y.Z、engine-vX.Y.Z 或 client-vX.Y.Z。"
  exit 1
fi

same_commit() {
  local local_sha
  local_sha="$(git rev-parse "refs/tags/${TAG}^{commit}")"
  [[ "$local_sha" == "$GITHUB_SHA" ]]
}

reject_other_commit() {
  local local_sha
  local_sha="$(git rev-parse "refs/tags/${TAG}^{commit}")"
  echo "标签 ${TAG} 已经指向 ${local_sha}。"
  echo "这次提交是 ${GITHUB_SHA}。请换一个新的版本号。工作流不会移动已有标签。"
  exit 1
}

fetch_err="$(mktemp)"
if git fetch --force origin "refs/tags/${TAG}:refs/tags/${TAG}" 2>"$fetch_err"; then
  rm -f "$fetch_err"
  if same_commit; then
    echo "标签 ${TAG} 已指向这次提交。"
    exit 0
  fi
  reject_other_commit
fi

if ! grep -q "couldn't find remote ref" "$fetch_err"; then
  cat "$fetch_err" >&2
  rm -f "$fetch_err"
  echo "无法确认标签 ${TAG} 是否已经存在。"
  exit 1
fi
rm -f "$fetch_err"

git tag "$TAG" "$GITHUB_SHA"
push_err="$(mktemp)"
if git push origin "refs/tags/${TAG}" 2>"$push_err"; then
  rm -f "$push_err"
  echo "已在 ${GITHUB_SHA} 创建标签 ${TAG}。"
  exit 0
fi

if git fetch --force origin "refs/tags/${TAG}:refs/tags/${TAG}" 2>/dev/null; then
  rm -f "$push_err"
  if same_commit; then
    echo "标签 ${TAG} 已由另一个任务指向这次提交。"
    exit 0
  fi
  reject_other_commit
fi

cat "$push_err" >&2
rm -f "$push_err"
echo "无法创建标签 ${TAG}。"
exit 1
