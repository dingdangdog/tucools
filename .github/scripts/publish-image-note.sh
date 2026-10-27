#!/usr/bin/env bash
# 把镜像坐标和摘要附到 Release。不改已有说明。
set -euo pipefail

: "${KIND:?}"
: "${IMAGE:?}"
: "${VERSION:?}"
: "${DIGEST:?}"
: "${MARK_LATEST:?}"
: "${TAG:?}"

case "$KIND" in
  web|engine) ;;
  *)
    echo "未知镜像：${KIND}"
    exit 1
    ;;
esac

export PRODUCT="$KIND"
bash .github/scripts/ensure-tag.sh
bash .github/scripts/ensure-release.sh

DIR="$(mktemp -d)"
trap 'rm -rf "$DIR"' EXIT
FILE="${DIR}/tucools-${KIND}-${VERSION}.txt"
cat > "$FILE" <<EOF
${IMAGE}:${VERSION}
digest=${DIGEST}
latest=${MARK_LATEST}
EOF

gh release upload "$TAG" "$FILE" --clobber

if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
  cat >> "$GITHUB_STEP_SUMMARY" <<EOF
### tucools-${KIND}

- ${IMAGE}:${VERSION}
- digest ${DIGEST}
- latest: ${MARK_LATEST}

EOF
fi
