# 014 增加应用商店尺寸

**日期：** 2026-10-24

## 背景 / 问题

已有的社交尺寸不能生成应用商店要求的截图、图标和宣传图。上架 App Store、Google Play 或 Chrome 网上应用店时，需要把一张图放进各自规定的像素，并选择留白、铺满裁切、拉伸或平铺。

## 变更内容

- 新增本地工具「应用商店尺寸」，地址 `/store`，功能名 `store`。导航放在常规处理的社交尺寸后面。
- 尺寸按 2026-10-24 的公开规范写入：iPhone、iPad、Mac、iPhone Duo、App Store 图标、Google Play 和 Chrome 网上应用店。默认勾选各商店当前常用尺寸。可旋转的截图可以另出横屏。
- 放入方式为留白、铺满裁切、拉伸和平铺。底色可以是透明、白、黑或自定义。导出 PNG 或 JPEG。JPEG 遇到透明底色时先铺白。
- 每张结果可以下载或复制到剪贴板，多张可以打包下载。处理在浏览器本地完成，不请求引擎。

## 影响范围

- `apps/web/src/pages/StorePage.vue`、`utils/store-sizes.ts`、`components/ResultGrid.vue`
- `apps/web/src/nav.ts`、`router.ts`、`seo.ts`、`content/`、`index.html`
- `docs/deploy.md`、`design/006-store-sizes.md`、`AGENTS.md`

## 数据库与兼容性

- 无数据库影响。
- 原有工具地址和功能名不变。`TUCOOLS_FEATURES` 可新增 `store`；不设置时仍显示全部工具。
- 未列入 Apple Watch、Apple TV、Apple Vision Pro 和 Microsoft Store。更小的旧 iPhone、旧 iPad 档位不单列。
- 站点地图由 220 条变为 231 条：新增工具在 11 种语言里各有一个地址。

## 验证

- 用 Node 检查尺寸目录：31 个预设，标识不重复，11 种语言的名称与预设一一对应。默认常用尺寸在竖屏下是 12 张；横屏时 Mac 仍是 2880×1800，iPhone 1206×2622 变为 2622×1206；同时生成竖屏和横屏时，1206×2622 会出两张，1024×1024 图标只出一张。
- `npm run typecheck`：通过。
- `npm run build:web`：通过。`/store` 的标题是「应用商店尺寸 · 图酷」。`sitemap.xml` 有 231 条地址，含 `/store` 和 `/en/store`。
- 未启动开发服务器，未在浏览器里放入图片、切换放入方式、下载或复制。
