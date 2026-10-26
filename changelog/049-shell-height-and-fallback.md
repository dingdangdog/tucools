# 049 纯文本不再挡住界面，菜单列锁在视口高度

**日期：** 2026-10-26

## 背景 / 问题

有脚本时，页面会先画出 `#app` 里的纯文本说明，等配置请求结束后才换成界面。

广告脚本给 `#app` 和外壳写了 `height: auto !important`。外壳因此只跟左侧菜单的内容一样高。1080 高的窗口里，整页只有大约 701 像素，菜单底部按钮贴着最后一项，下面是空的，锚点广告被裁在视口底边。

## 变更内容

- 头脚本立刻加上 `tucools-js`，并藏起纯文本说明。没开脚本时，说明仍可整页滚动。
- 有脚本时，页面锁在 `100dvh`。外壳用最小和最大高度撑满视口，裁切改用 `overflow: clip`。
- 左侧菜单列高度改为自动，在外壳这一行里拉到视口底。上面是名称，中间只滚动菜单，底部按钮留在视口底边。
- 页头下面的主体是纵向弹性盒，当前页面占满剩余高度。

## 影响范围

- `apps/web/index.html`
- `apps/web/src/styles.css`
- `apps/web/src/components/AppShell.vue`
- `apps/web/src/components/BatchLayout.vue`
- `apps/web/src/components/StudioLayout.vue`
- `AGENTS.md`
- `design/007-tool-rail-ads.md`

## 数据库与兼容性

- 无数据变化。
- 纯文本仍留在 HTML 里，给不执行脚本的抓取用。
- 广告单元仍在工具页右侧。

## 验证

- 在正在打开的 `https://easyimage.work/fade` 上，保留广告脚本写上的 `height: auto !important`，套上与这次相同的高度规则：视口 1080，菜单列 1080，底部按钮贴在 1080，选图区 960。
- `npm run typecheck`：通过。
- 线上站点仍是旧构建，这次没有重新构建或发布。

## 未做事项

- 未在本地开发服务里打开改过的源码。
- 未重新构建页面镜像。
