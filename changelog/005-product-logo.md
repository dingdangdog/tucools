# 005 沿用原图酷 LOGO

**日期：** 2026-10-24

## 背景 / 问题

侧栏品牌位用的是通用图片图标，浏览器标签也没有产品图标。原图酷桌面版的品牌图是 `logo.webp`，安装包图标是同一套图形。

## 变更内容

- 把原项目 `ui/public/logo.webp` 放到 `apps/web/public/logo.webp`。
- 侧栏「图酷」前显示这张 LOGO，页面图标同样指向它。
- 桌面窗口使用已有的 `apps/desktop/build/icon.ico`。该文件与原项目 `icons/icon_256x256.ico` 哈希一致。

## 影响范围

- `apps/web/public/logo.webp`
- `apps/web/index.html`
- `apps/web/src/components/AppShell.vue`
- `apps/desktop/main.js`

## 数据库与兼容性

- 无数据库影响。
- 安装包图标文件没有更换。

## 验证

- 已在浏览器打开首页，侧栏和标签图标显示原图酷 LOGO。
- 未启动 Electron，窗口图标未在安装包里实测。
