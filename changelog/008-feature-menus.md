# 008 功能菜单可配置，缺模型时停用 AI

**日期：** 2026-10-24

## 背景 / 问题

侧栏和首页一直显示全部工具，部署时不能按场景收起。客户端也没有本机开关。抠图、优化和消除在没有可用模型时仍能选图并提交，失败后才看到错误，页面也不说明模型从哪里下载。

## 变更内容

- 新增环境变量 `TUCOOLS_FEATURES`，值为逗号分隔的功能名。未设置时显示全部。开发页、Docker 页面容器和安装包各自读取自己进程里的变量，并通过 `/app-config.json` 交给同一份页面。
- 安装包顶栏增加「功能菜单」。勾选写入本机 `localStorage` 键 `tucools-features`，并且不能超出环境变量允许的范围。浏览器部署不提供这个开关。
- 直接打开未显示功能的地址会回到首页。
- 打开抠图、优化或消除时先做对应的模型检查。没有可用模型时停用选图和开始处理，并给出仓库 `https://github.com/dingdangdog/tucools` 与发布页 `https://github.com/dingdangdog/tucools/releases`。已有部分模型时功能可用，只列出可用项。

## 影响范围

- `apps/web` 的导航、首页、三个 AI 页面、路由和文案
- `apps/web/vite.config.ts`、`apps/desktop/host.js`
- `deploy/nginx.conf`、`deploy/Dockerfile.web`、`deploy/web-entrypoint.sh`、`deploy/docker-compose.yml`
- `docs/deploy.md`、`docs/models.md`、`README.md`、`design/003-feature-menus.md`

## 数据库与兼容性

- 无数据库影响。
- 不设置 `TUCOOLS_FEATURES` 时，菜单与以前一样全部显示。
- 健康检查的响应字段不变。模型仍不进入镜像和安装包。
- 本机主题缓存不受影响。新的缓存键只在客户端写入。

## 验证

- `npm run typecheck`：通过。
- `node --check apps/desktop/host.js`：通过。
- 未启动页面、引擎或 Docker，未在浏览器里点击菜单和 AI 页面。
- 未构建镜像，未打包安装包。

## 未做事项

- 发布页目前指向仓库的 Releases 列表。具体模型压缩包的文件名要等实际发布后再写到文档里。
