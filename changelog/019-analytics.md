# 019 按环境变量接入 Google Analytics

**日期：** 2026-10-24

## 背景 / 问题

公开站点已经可以用环境变量接入 AdSense，但还没有 Google Analytics。easyimage 在页面头部加载 gtag.js 并写入固定测量 ID，图酷需要同一套脚本，同时让每个部署填写自己的 ID。

## 变更内容

- 新增 `TUCOOLS_ANALYTICS_ID`。合法值是 `G-` 加 6 到 20 位字母或数字。开发服务器、页面容器和安装包静态服务都在启动时读取，并放进 `/app-config.json` 的 `analyticsId`。
- 页面先写入 `dataLayer` 和 `gtag('config', ID)`，再加载 `gtag.js`。未配置或格式不对时不加载脚本。
- 单页切换不整页刷新，因此这次 config 不自动发送浏览。路由完成后再发送 `page_view`，使用切换后的地址和标题。

## 影响范围

- `apps/web/src/analytics.ts`、`runtime-config.ts`、`router.ts`、`vite.config.ts`。
- `deploy/web-entrypoint.sh`、`deploy/docker-compose.yml`。
- `apps/desktop/host.js`。
- `docs/deploy.md`、`develop.md`、`README.md`、`AGENTS.md`。

## 数据库与兼容性

- 无数据库影响。
- 未设置 `TUCOOLS_ANALYTICS_ID` 时，页面不请求 gtag.js。安装包默认不设置。
- `app-config.json` 增加 `analyticsId`。旧的功能菜单和广告字段保留。
- 测量 ID 不进入镜像、安装包或仓库。工具地址和引擎契约不变。

## 验证

- `npm run typecheck`：通过。
- Node 检查测量 ID 解析：通过。
- `node --check apps/desktop/host.js`：通过。
- Git Bash 检查 `deploy/web-entrypoint.sh` 语法，并用同一套规则核对合法与非法 ID：通过。
- 未启动开发服务器，未在浏览器里确认 gtag 请求。未创建 Docker 容器，因此没有在容器里实测入口脚本写文件。
