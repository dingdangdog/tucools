#!/bin/sh
set -eu
raw=$(printf '%s' "${TUCOOLS_FEATURES:-}" | tr -cd 'A-Za-z0-9,-')
printf '{"features":"%s"}\n' "$raw" > /usr/share/nginx/html/app-config.json
exec /docker-entrypoint.sh "$@"
