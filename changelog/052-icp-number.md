# 052 左侧菜单可显示备案号

**日期：** 2026-10-27

## 背景 / 问题

公开站点需要在页面上展示工信部 ICP 备案号。编号随部署变化，不能写进仓库或镜像。

## 变更内容

- 新增 `TUCOOLS_ICP_NUMBER`。合法值是省份简称加 `ICP备`、6 到 14 位数字和 `号`，可以带 `-1` 这类后缀。
- 开发服务器、页面容器和安装包静态服务在启动时读取，并放进 `/app-config.json` 的 `icpNumber`。
- 配置合法时，展开的左侧菜单在底部按钮下面显示这一行，并链接到 `https://beian.miit.gov.cn/`。未配置或格式不对时不留空位。菜单收成图标栏时不显示。

## 影响范围

- `apps/web/src/icp.ts`、`runtime-config.ts`、`vite.config.ts`、`AppShell.vue`、`styles.css`
- `apps/desktop/host.js`
- `deploy/web-entrypoint.sh`、`deploy/docker-compose.yml`、`deploy/docker-compose.deploy.yml`
- `AGENTS.md`、`develop.md`、`docs/deploy.md`

## 数据库与兼容性

- 无数据变化。
- `app-config.json` 增加 `icpNumber`。原来的功能菜单、广告和统计字段保留。
- 未设置时行为和以前一样。安装包默认不设置。

## 验证

- `node` 检查备案号解析：`京ICP备12345678号`、`粤ICP备2024000001号-1`、`内蒙古ICP备123456号` 保留。空字符串、缺少省份、位数不够、小写 `icp`、脚本片段和过长后缀变成空字符串。
- `npm run typecheck`：通过。
- 未启动开发服务器，未在浏览器里看这一行。

## 未做事项

- 未重新构建页面镜像。
- 未在容器里实测入口脚本。
