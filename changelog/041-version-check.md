# 041 版本页检查 GitHub 发布

**日期：** 2026-10-26

## 背景 / 问题

安装包和网页都没有地方查看当前版本，也没有办法对照 GitHub 发布页看有没有更新。模型包占用了固定的 `models` 标签，不能把最近一次发布直接当成软件版本。

## 变更内容

- 增加 `/version` 页面。打开后显示当前版本，并向 GitHub 查询这个版本标签的发布时间。
- 页面提供打开仓库的按钮，以及检测新版本的按钮。检测到更新后只在页面上提示版本号和发布日期，不跳转。
- 检测读取发布列表，跳过草稿、预发布和 `models` 这类非版本标签，再与当前版本比较。
- 侧栏底部增加版本入口。网页和客户端都能打开。
- 页面镜像构建可以传入 `VITE_APP_VERSION`。没有这个值时仍使用 `apps/web/package.json` 里的版本。

## 影响范围

- `apps/web/src/pages/VersionPage.vue`
- `apps/web/src/version.ts`
- `apps/web/src/router.ts`
- `apps/web/src/seo.ts`
- `apps/web/src/components/AppShell.vue`
- `apps/web/src/content/` 各语言文案
- `apps/web/env.d.ts`
- `apps/web/tsconfig.json`
- `deploy/Dockerfile.web`
- `.github/workflows/image-reusable.yml`

## 数据库与兼容性

- 无数据库影响。
- 版本页不进入站点地图。
- 旧地址和工具路由不变。
- 未设置 `VITE_APP_VERSION` 的已有镜像仍显示构建时写进页面包的版本号。

## 验证

- `node --experimental-strip-types --test apps/web/src/version.test.ts` 通过：忽略模型包标签、草稿和预发布；当前版本落后、相同或更高时的比较；发布时间为空。
- `npm run typecheck` 通过。
- 浏览器打开正在运行的 http://127.0.0.1:13175/version 。页面显示 0.1.0；仓库里还没有 `v0.1.0`，所以发布时间写明没有找到。点击检测后地址不变，结果是「当前已是最新版本」，因为已发布的最高版本是 `v0.0.5`，`models` 标签不参与比较。用页面内的请求替身确认检测到更高版本时只显示「发现新版本」和日期。亮色和窄屏下版本、时间和两个按钮都在。

## 未测试

- 没有构建页面镜像，没有确认 GitHub Actions 把版本号写进镜像。
- 没有在安装包里点击这个页面。
