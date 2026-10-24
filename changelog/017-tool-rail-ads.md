# 017 工具页左右分区，广告按环境变量接入

**日期：** 2026-10-24

## 背景 / 问题

手机端打开和关闭导航时，按钮上带有「工具」和「关闭」。页头没有仓库入口。工具页把选项放在右侧，常见问题在页面下方，公开站点无法按部署填写自己的 AdSense 编号。

## 变更内容

- 页头的打开、关闭按钮只保留图标，名称仍留给读屏。页头增加 GitHub 仓库图标链接。
- 单图和批量工具改为左侧功能区、右侧广告和常见问题。宽屏左右分栏，窄屏上下排列。未配置广告单元时不显示广告区。
- `TUCOOLS_ADSENSE_CLIENT` 在容器启动、开发服务器和安装包静态服务里生效。合法时提供 `/ads.txt` 并加载 AdSense 脚本。`TUCOOLS_ADSENSE_SLOT` 用来填充右侧广告单元。编号不进入镜像和仓库。

## 影响范围

- `apps/web` 的外壳、两种工具布局、运行时配置和各语言文案。
- `deploy/web-entrypoint.sh`、`deploy/nginx.conf`、`deploy/docker-compose.yml`。
- `apps/desktop/host.js`。
- `docs/deploy.md`、`README.md`、`AGENTS.md`。

## 数据库与兼容性

- 无数据库影响。
- 未设置广告变量时，页面不请求广告脚本，`/ads.txt` 为 404。
- `app-config.json` 增加 `adsenseClient` 和 `adsenseSlot`。旧的功能菜单字段保留。
- 工具地址、保存方式和引擎契约不变。

## 验证

- `npm run typecheck`：通过。
- Node 检查发布商编号、广告位和 `ads.txt` 文本：通过。
- `node --check apps/desktop/host.js`：通过。
- Git Bash 检查 `deploy/web-entrypoint.sh` 语法，并用同一套规则核对编号和 `ads.txt` 文本：通过。
- 未启动开发服务器，未在浏览器里查看页头、左右栏和广告脚本。未创建 Docker 容器，因此没有在容器里实测入口脚本写文件。
