# 048 外壳锁定视口，广告位改为占位

**日期：** 2026-10-26

## 背景 / 问题

主体内容高于视口时，左侧菜单被同一行撑高，窗口整页滚动，菜单跟着离开视口。广告位被做成带标题和 250px 最小高度的卡片，盖住了 AdSense 自适应单元本身的尺寸。

## 变更内容

- 页面外壳锁在视口高度。左侧菜单保持视口高度，菜单过长时只滚动菜单。页头固定。主体在自己的区域里滚动。
- 工具页右侧广告只保留 `<ins class="adsbygoogle">`，`data-ad-format="auto"`、`data-full-width-responsive="true"`。去掉卡片、标题和固定高度。未配置时仍不留空位。

## 影响范围

- `apps/web/src/styles.css`、`AppShell.vue`、`AdSlot.vue`、`ToolRail.vue`
- 各语言文案里的 `adLabel`
- `AGENTS.md`、`design/007-tool-rail-ads.md`、`docs/deploy.md`

## 数据库与兼容性

- 无数据变化。
- 广告脚本、单元编号和未配置时不展示的行为不变。无脚本访问时的正文页仍可滚动。

## 验证

- `npm run typecheck`：见本次记录补充。
- 未启动开发服务器，未在浏览器里核对滚动归属和广告占位。

## 未做事项

- 未用真实 AdSense 单元确认脚本填入后的高度。
