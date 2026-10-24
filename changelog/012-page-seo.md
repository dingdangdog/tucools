# 012 为每个工具页提供可收录的独立地址

**日期：** 2026-10-24

## 背景 / 问题

各工具已经有 `/compress`、`/cutout` 这样的路由，但服务器始终返回同一份首页 HTML。标题和描述只在 JavaScript 执行后才改变。搜索引擎和生成式引擎不执行脚本时，只能看到首页说明。

## 变更内容

- 以 `zh.ts` 的工具说明和常见问题为来源，为首页、19 个工具和功能菜单生成独立的标题、描述、canonical、Open Graph 和 JSON-LD。
- 构建时为每个地址写出自己的 `index.html`，并生成 `robots.txt`、`sitemap.xml`、`llms.txt`、`llms-full.txt`。
- 不执行脚本时，页面用 `noscript` 给出该工具的说明、常见问题和返回入口。浏览器里的常见问题默认收起，放在批量页底部或对照页侧栏。
- 未知地址显示「页面不存在」，并标记 `noindex`。功能菜单保留地址，但不进入站点地图。
- 浏览器运行后把规范地址改成当前域名。页面容器在 `TUCOOLS_SITE_URL` 是合法站点根时，把站点地图和 `llms.txt` 改成绝对地址。
- 安装包的静态服务在目录下存在 `index.html` 时返回该文件。

## 影响范围

- `apps/web/src/content/zh.ts`、`seo.ts`、`apply-seo.ts`、`router.ts`、`index.html`、`vite.config.ts`、`seo-plugin.ts`
- `apps/web/src/components/PageFacts.vue`、`BatchLayout.vue`、`StudioLayout.vue`
- `apps/web/src/pages/HomePage.vue`、`NotFoundPage.vue`
- `apps/desktop/host.js`
- `deploy/web-entrypoint.sh`、`deploy/docker-compose.yml`
- `docs/deploy.md`、`README.md`、`design/004-page-seo.md`

## 数据库与兼容性

- 无数据库影响。
- 工具地址不变。没有新增语言、博客或第二套页面。
- 未设置 `TUCOOLS_SITE_URL` 时，收录文件继续使用站内路径。
- `TUCOOLS_FEATURES` 仍只影响浏览器显示。站点地图不按这个变量删减。
- 模型文件仍不进入镜像和安装包。

## 验证

- `npm run typecheck`：通过。
- `npm run build:web`：通过。构建结果里首页标题是「图酷」，`/compress` 标题是「压缩 · 图酷」，`/prompt` 标题是「AI提示词提取 · 图酷」，`/menus` 为 `noindex`。`sitemap.xml` 有 20 条地址，不含 `/menus`。
- 用与容器入口相同的替换规则处理构建出的收录文件：站点地图和 `llms.txt` 变成 `https://img.example` 绝对地址，再替换一次不会重复加前缀。未启动 Docker，未在容器里执行入口脚本。
- 开发页 `http://127.0.0.1:13176`：不执行脚本的响应里，`/compress`、`/prompt`、`/cutout`、`/menus`、未知地址的标题和 robots 各不相同。
- 浏览器中打开首页、压缩、抠图和未知地址。压缩页仍可选择格式和文件，常见问题在工具下方。抠图页在引擎未启动时显示原有的不可用提示，并带有本页问题。未知地址显示「页面不存在」和回到开始。窄屏下压缩页的工具和问题仍在同一列。切换到亮色后，主题记录为 `light`，页面去掉了暗色类。
- `node --check apps/desktop/host.js`：通过。未打开安装包，未在桌面壳里请求 `/compress`。

## 未做事项

- 未按部署时隐藏的功能过滤站点地图。
- 未做完整服务端渲染。关闭 JavaScript 后只能阅读说明，不能在页面里处理图片。
