# 搜索与生成式引用

## 1. 背景与目标

- 当前问题：工具页已经预渲染标题、说明、hreflang、JSON-LD、`llms.txt` 和站点地图。检索标题仍是「压缩 · 图酷」这类短名。页面正文只在 JavaScript 运行后出现，不执行脚本的生成式引擎读不到可引用的说明。`llms.txt` 链到网页，而不是干净的 Markdown。
- 目标用户与场景：公开站点希望被普通搜索引擎收录，也希望被 ChatGPT、Perplexity、Claude、Gemini 等生成式回答引用。
- 成功标准：每种语言的每个可索引地址有检索标题、静态正文和 Markdown。`llms.txt` 指向 Markdown。`robots.txt` 明确允许搜索、生成式引用和训练。浏览器里的工具操作保持原样。
- 非目标：不做博客，不做第二套界面，不把推理放进浏览器，不代替站长向搜索引擎提交站点地图。

## 2. 现状与约束

- 文案仍以 `apps/web/src/content/zh.ts` 的 `Copy` 为准。构建插件继续为每种语言写独立 HTML。
- 同一份 `apps/web` 构建给 Docker 和安装包。安装包不需要被搜索引擎收录，但可以带上同一批静态文件。
- 公开域名在构建镜像时可能未知。绝对地址仍由 `VITE_SITE_URL` 或容器启动时的 `TUCOOLS_SITE_URL` 补上。

## 3. 方案概览

检索标题单独存放，顶栏里的短名称不变。构建出的 HTML 在 `#app` 里放一段同页说明；Vue 挂载后替换成工具界面。每个可索引页面再写一份 Markdown。`llms.txt` 按 llms.txt v2 链到这些 Markdown，页面头部用 `rel="alternate" type="text/markdown"` 和 `rel="describedby"` 指向它们。

`robots.txt` 增加 `Content-Signal: search=yes, ai-input=yes, ai-train=yes`，并补上回答场景里常见的爬虫名。Markdown 和 `llms.txt` 由页面容器加 `noindex`，避免和规范网页重复出现在搜索结果里。

## 4. 详细设计

### 4.1 数据模型与权威来源

`seo.homeDocumentTitle` 和每个工具的 `seo.tools.*.documentTitle` 是检索标题。页面内的短标题仍用 `tools.*.title`。相关工具关系写在 `apps/web/src/seo.ts`，名称走现有文案。站点地图的 `lastmod` 使用收录内容修订日 `2026-10-25`，内容再改时一起改。

### 4.2 收录文件

可索引页面的 Markdown 地址是 `/compress.md`、`/index.md`，其他语言加前缀，例如 `/en/compress.md`。功能菜单不生成 Markdown，也不进入站点地图。容器入口把 Markdown 里的站内链接、`text/markdown` 和 `describedby` 一起改成绝对地址，不改 `/assets/`。

### 4.3 页面

工具页右侧在常见问题下增加相关工具链接。脚本运行前，`#app` 里的说明使用同一组标题、问题和链接，避免只放在 `noscript` 里而被提取器跳过。

## 5. 风险与取舍

- 脚本启动前会先看到一段说明，挂载后换成工具界面。这是同一页的说明，不是给爬虫看的另一套内容。
- 允许 `ai-train` 与现有爬虫允许名单一致。若以后只想要引用、不想被训练，把信号改成 `ai-train=no` 并删除训练用爬虫分组。
- `noindex` 只由页面容器的响应头发出。安装包里的 Markdown 不面向公开搜索。

## 6. 明确不做

- 不新增博客或落地长文。
- 不按 `TUCOOLS_FEATURES` 从站点地图删除工具。
- 不在仓库里写入搜索引擎的验证码或 IndexNow 密钥。
