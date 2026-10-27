#!/usr/bin/env bash
# 只比较同一业务的标签，例如 web-v1.2.3。已有更高版本时向标准输出打印 true，否则打印 false。
# 不读取不带业务前缀的 vX.Y.Z，也不读取另一个业务的标签。
set -euo pipefail

PREFIX="${PREFIX:?}"
VERSION="${VERSION:?}"
case "$PREFIX" in
  web-|engine-|client-) ;;
  *)
    echo "业务前缀只能是 web-、engine- 或 client-。当前是：${PREFIX}" >&2
    exit 1
    ;;
esac

semver='^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$'
if [[ ! "$VERSION" =~ $semver ]]; then
  echo "版本号无效：${VERSION}" >&2
  exit 1
fi

is_newer() {
  local left="$1"
  local right="$2"
  local l1 l2 l3 r1 r2 r3
  IFS=. read -r l1 l2 l3 <<< "$left"
  IFS=. read -r r1 r2 r3 <<< "$right"
  if (( 10#$l1 != 10#$r1 )); then
    (( 10#$l1 > 10#$r1 ))
    return
  fi
  if (( 10#$l2 != 10#$r2 )); then
    (( 10#$l2 > 10#$r2 ))
    return
  fi
  (( 10#$l3 > 10#$r3 ))
}

tags="$(git ls-remote --tags origin "refs/tags/${PREFIX}v*")"
while IFS=$'\t' read -r _ ref; do
  [[ -n "${ref:-}" ]] || continue
  name="${ref##*/}"
  name="${name%%^*}"
  other="${name#"${PREFIX}v"}"
  if [[ ! "$other" =~ $semver ]]; then
    continue
  fi
  if is_newer "$other" "$VERSION"; then
    echo "已有更高版本标签 ${name}，这次不移动 latest。" >&2
    echo true
    exit 0
  fi
done <<< "$tags"

echo false
