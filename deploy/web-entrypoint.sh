#!/bin/sh
set -eu

# 发布商与广告位规则与 apps/web/src/ads.ts 一致。测量 ID 规则与 apps/web/src/analytics.ts 一致。
normalize_client() {
  text=$(printf '%s' "$1" | tr -d '[:space:]' | tr '[:upper:]' '[:lower:]')
  case "$text" in
    ca-pub-*) digits=${text#ca-pub-} ;;
    pub-*) digits=${text#pub-} ;;
    *) digits=$text ;;
  esac
  if printf '%s' "$digits" | grep -Eq '^[0-9]{10,20}$'; then
    printf 'ca-pub-%s' "$digits"
  fi
}

raw=$(printf '%s' "${TUCOOLS_FEATURES:-}" | tr -cd 'A-Za-z0-9,-')
client=$(normalize_client "${TUCOOLS_ADSENSE_CLIENT:-}")
slot=$(printf '%s' "${TUCOOLS_ADSENSE_SLOT:-}" | tr -d '[:space:]')
if printf '%s' "$slot" | grep -Eq '^[0-9]{6,20}$'; then
  :
else
  if [ -n "$slot" ]; then
    echo "忽略 TUCOOLS_ADSENSE_SLOT：需要 6 到 20 位数字。" >&2
  fi
  slot=""
fi
if [ -n "$(printf '%s' "${TUCOOLS_ADSENSE_CLIENT:-}" | tr -d '[:space:]')" ] && [ -z "$client" ]; then
  echo "忽略 TUCOOLS_ADSENSE_CLIENT：需要 ca-pub- 加 10 到 20 位数字，也可以只写数字。" >&2
fi
if [ -n "$slot" ] && [ -z "$client" ]; then
  echo "忽略 TUCOOLS_ADSENSE_SLOT：还没有有效的 TUCOOLS_ADSENSE_CLIENT。" >&2
  slot=""
fi
analytics=$(printf '%s' "${TUCOOLS_ANALYTICS_ID:-}" | tr -d '[:space:]' | tr '[:lower:]' '[:upper:]')
if printf '%s' "$analytics" | grep -Eq '^G-[A-Z0-9]{6,20}$'; then
  :
else
  if [ -n "$analytics" ]; then
    echo "忽略 TUCOOLS_ANALYTICS_ID：需要 G- 加 6 到 20 位字母或数字。" >&2
  fi
  analytics=""
fi
printf '{"features":"%s","adsenseClient":"%s","adsenseSlot":"%s","analyticsId":"%s"}\n' "$raw" "$client" "$slot" "$analytics" > /usr/share/nginx/html/app-config.json
if [ -n "$client" ]; then
  pub=${client#ca-}
  printf 'google.com, %s, DIRECT, f08c47fec0942fa0\n' "$pub" > /usr/share/nginx/html/ads.txt
else
  rm -f /usr/share/nginx/html/ads.txt
fi
origin=$(printf '%s' "${TUCOOLS_SITE_URL:-}" | tr -d '[:space:]' | sed 's:/*$::')
rewrite_site_urls() {
  sed -i \
    -e "s|<loc>/|<loc>${origin}/|g" \
    -e "s|\\(hreflang=\"[^\"]*\" href=\"\\)/|\\1${origin}/|g" \
    -e "s|\\(rel=\"canonical\" href=\"\\)/|\\1${origin}/|g" \
    -e "s|\\(property=\"og:url\" content=\"\\)/|\\1${origin}/|g" \
    -e "s|\\(property=\"og:image\" content=\"\\)/|\\1${origin}/|g" \
    -e "s|\\(name=\"twitter:image\" content=\"\\)/|\\1${origin}/|g" \
    -e "s|\\(type=\"text/markdown\" href=\"\\)/|\\1${origin}/|g" \
    -e "s|\\(rel=\"describedby\" href=\"\\)/|\\1${origin}/|g" \
    -e "s|\"url\":\"/|\"url\":\"${origin}/|g" \
    -e "s|\"item\":\"/|\"item\":\"${origin}/|g" \
    -e "s|\"@id\":\"/|\"@id\":\"${origin}/|g" \
    -e "s|\"logo\":\"/|\"logo\":\"${origin}/|g" \
    -e "s|Sitemap: /sitemap.xml|Sitemap: ${origin}/sitemap.xml|" \
    -e "s|](/|](${origin}/|g" \
    "$1"
}
if [ -n "$origin" ]; then
  if printf '%s' "$origin" | grep -Eq '^https?://[A-Za-z0-9.-]+(:[0-9]+)?$'; then
    find /usr/share/nginx/html -type f \( \
      -name index.html -o -name robots.txt -o -name sitemap.xml -o -name llms.txt -o -name llms-full.txt -o -name '*.md' \
    \) | while IFS= read -r file; do
      rewrite_site_urls "$file"
    done
  else
    echo "忽略 TUCOOLS_SITE_URL：需要不带路径的 http 或 https 站点根地址。" >&2
  fi
fi
exec /docker-entrypoint.sh "$@"
