# 028 加强公开站点的搜索与生成式引用

**日期：** 2026-10-25

## 背景 / 问题

网页已经为每种语言预渲染标题、说明、hreflang、JSON-LD 和 `llms.txt`。检索标题仍是工具短名，例如「压缩 · 图酷」，和「在线压缩图片」这类问法对不上。正文只在 JavaScript 运行后出现，不执行脚本的生成式引擎经常跳过 `noscript`。`llms.txt` 链到网页，而不是可直接引用的 Markdown。

## 变更内容

- 11 种语言的首页和工具页使用单独的检索标题。顶栏里的短名称不变。
- 预渲染正文放进 `#app`。不执行脚本时能读到标题、说明、常见问题、相关工具和首页工具链接。Vue 挂载后换成原来的工具界面。
- 每个可索引页面生成 Markdown。`llms.txt` 指向这些文件。页面增加 `rel="alternate" type="text/markdown"` 和 `rel="describedby"`。
- `robots.txt` 增加 `Content-Signal: search=yes, ai-input=yes, ai-train=yes`，并补上 Claude-User、Perplexity-User、Amazonbot、Meta-ExternalAgent、CCBot。
- 站点地图为每条地址写入 `lastmod`。JSON-LD 补上组织和网站实体。工具页显示相关工具。
- 页面容器把 Markdown 标成 `text/markdown`，并为 Markdown 与 `llms.txt` 加上 `noindex`。容器入口会改写 Markdown 链接。

## 影响范围

- `apps/web/src/seo.ts`、`apply-seo.ts`、`seo-plugin.ts`、`styles.css`
- `apps/web/src/components/PageFacts.vue`
- `apps/web/src/content/` 下 11 个语言文件
- `apps/desktop/host.js`
- `deploy/nginx.conf`、`deploy/web-entrypoint.sh`
- `docs/deploy.md`、`develop.md`、`AGENTS.md`、`design/010-search-discovery.md`

## 数据库与兼容性

- 无数据库影响。
- 原有网页地址不变。未设置站点根时，收录文件继续使用站内路径。
- 功能菜单仍是 `noindex`，不进入站点地图，也不生成 Markdown。
- 安装包带上同一批静态文件。公开搜索面向设置了 `TUCOOLS_SITE_URL` 的网页部署。

## 验证

- `npm run typecheck`：通过。
- `npm run build:web`：通过。构建结果有 231 条站点地图地址，不含 `/menus` 和 `/compress.md`。中文压缩页标题是「在线压缩图片，不上传 · 图酷」，正文在 `#app`，`noscript` 为空。英文压缩页标题是「Compress images online without uploading · 图酷」，`lang="en-US"`。阿拉伯语首页为 `lang="ar"`、`dir="rtl"`。`robots.txt` 含 `Content-Signal: search=yes, ai-input=yes, ai-train=yes`。`llms.txt` 指向 `/compress.md` 和 `/index.md`。
- 用与容器入口相同的替换规则处理构建结果：canonical、Markdown alternate、`describedby`、JSON-LD 的 `@id` 和 `logo`，以及 `compress.md` 里的链接，都变成 `https://img.example` 绝对地址。再替换一次没有重复加前缀。样式表的 `/assets/` 地址没有被改写。未启动 Docker，未在容器里执行入口脚本，也未执行 `nginx -t`。
- `node --check apps/desktop/host.js`：通过。未打开安装包。
- 已有的开发服务器 `http://127.0.0.1:13175` 上打开压缩页：标题为检索标题，常见问题下有「缩放」「转格式」。点击「缩放」后地址变为 `/resize`，标题变为「在线缩放图片 · 图酷」，相关工具为压缩、裁剪、社交尺寸。`/en/compress` 的标题、语言和相关工具是英文。保存的英语会把 `/` 打开为 `/en`，首页标题是英语检索标题，没有相关工具区。开发服务器能返回 `robots.txt`、`llms.txt` 和 `compress.md`。未在窄屏视口里单独检查。

## 未做事项

- 未向 Google Search Console 或 Bing 提交站点地图。
- 未新建开发服务器、Docker 或安装包。
- 未在真实搜索引擎或生成式引擎里确认收录。
