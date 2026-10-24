#!/bin/sh
set -eu
raw=$(printf '%s' "${TUCOOLS_FEATURES:-}" | tr -cd 'A-Za-z0-9,-')
printf '{"features":"%s"}\n' "$raw" > /usr/share/nginx/html/app-config.json
origin=$(printf '%s' "${TUCOOLS_SITE_URL:-}" | tr -d '[:space:]' | sed 's:/*$::')
rewrite_site_urls() {
  sed -i \
    -e "s|<loc>/|<loc>${origin}/|g" \
    -e "s|\\(hreflang=\"[^\"]*\" href=\"\\)/|\\1${origin}/|g" \
    -e "s|\\(rel=\"canonical\" href=\"\\)/|\\1${origin}/|g" \
    -e "s|\\(property=\"og:url\" content=\"\\)/|\\1${origin}/|g" \
    -e "s|\\(property=\"og:image\" content=\"\\)/|\\1${origin}/|g" \
    -e "s|\\(name=\"twitter:image\" content=\"\\)/|\\1${origin}/|g" \
    -e "s|\"url\":\"/|\"url\":\"${origin}/|g" \
    -e "s|\"item\":\"/|\"item\":\"${origin}/|g" \
    -e "s|Sitemap: /sitemap.xml|Sitemap: ${origin}/sitemap.xml|" \
    -e "s|](/|](${origin}/|g" \
    "$1"
}
if [ -n "$origin" ]; then
  if printf '%s' "$origin" | grep -Eq '^https?://[A-Za-z0-9.-]+(:[0-9]+)?$'; then
    find /usr/share/nginx/html -type f \( \
      -name index.html -o -name robots.txt -o -name sitemap.xml -o -name llms.txt -o -name llms-full.txt \
    \) | while IFS= read -r file; do
      rewrite_site_urls "$file"
    done
  else
    echo "忽略 TUCOOLS_SITE_URL：需要不带路径的 http 或 https 站点根地址。" >&2
  fi
fi
exec /docker-entrypoint.sh "$@"
