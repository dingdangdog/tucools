# 058 页面、引擎、客户端分开打标签并各自发布

**日期：** 2026-10-27

## 背景 / 问题

三个工作流已经能分开构建，但都挂在同一个 `vX.Y.Z` 上，Release 标题和说明也是同一份。下载的人看不出这一条是页面、引擎还是安装包。版本还要事先推好标签，三个业务也不能各自递增。

## 变更内容

- 在 Actions 里选择提交并填写版本号。构建成功后，工作流把 `web-vX.Y.Z`、`engine-vX.Y.Z` 或 `client-vX.Y.Z` 打在这次提交上。不再查找或要求已有的 `vX.Y.Z`。
- 每条 Release 使用各自的标题和英文说明：`TuCools Web … · 页面镜像`、`TuCools Engine … · 引擎镜像`、`TuCools Client … · 客户端安装包`。
- 镜像标签仍是不带前缀的版本号。`latest` 只和本业务的 `web-v*` 或 `engine-v*` 比较。
- 仓库的 Latest 留给当前最高的客户端发布。页面和引擎发布不占用它。
- 标签已指向别的提交时失败，不移动标签。
- 安装包里的版本页对照 `client-v*`，网页和 Docker 对照 `web-v*`。
- Actions 里的安装包工作流显示名改为「发布客户端」。

## 影响范围

- `.github/workflows/image-web.yml`
- `.github/workflows/image-engine.yml`
- `.github/workflows/image-reusable.yml`
- `.github/workflows/desktop.yml`
- `.github/scripts/resolve-version.sh`
- `.github/scripts/ensure-tag.sh`
- `.github/scripts/ensure-release.sh`
- `.github/scripts/higher-release.sh`
- `.github/scripts/image-tags.sh`
- `.github/scripts/publish-image-note.sh`
- `.github/scripts/publish-desktop-assets.sh`
- `.github/scripts/release-notes-web.md`
- `.github/scripts/release-notes-engine.md`
- `.github/scripts/release-notes-client.md`
- `.github/scripts/release-notes.md`（删除）
- `apps/web/src/version.ts`
- `apps/web/src/version.test.ts`
- `apps/web/src/pages/VersionPage.vue`
- `docs/deploy.md`
- `develop.md`
- `README.md`
- `README.zh-CN.md`
- `docs/2026-10-26-如何使用AI功能.md`
- `design/013-split-product-releases.md`
- `design/008-independent-release-workflows.md`
- `AGENTS.md`

## 数据库与兼容性

- 无数据库影响。
- 已经发出的 `vX.Y.Z`、`models` 和镜像标签不动。
- 旧的 `vX.Y.Z` 不再参与版本页比较。下一条 `client-v*` 或 `web-v*` 发布后，对应的版本页才有新的比较对象。
- 镜像坐标仍是 `ghcr.io/<所有者>/tucools-web:<版本>` 和 `tucools-engine:<版本>`。两个版本不同时，分别设置 `TUCOOLS_WEB_IMAGE` 和 `TUCOOLS_ENGINE_IMAGE`。
- README 上的三个 release 徽章在第一条对应标签出现之前会显示还没有发布。

## 验证

- `npm run typecheck` 通过。
- `node --experimental-strip-types --test apps/web/src/version.test.ts` 通过：只比较同一业务，页面不被更高的客户端或引擎版本带动，发布时间读取 `web-v0.1.0`。
- 用 Git Bash 在临时仓库里跑了版本解析、镜像 `latest`、打标签和 Release 参数：`0.3.0`、`v0.5.0`、`web-v0.4.0` 得到对应业务标签；别的业务前缀、空版本、`01.2.3`、`1.2.3-beta` 被拒绝。`always`、`yes` 带 `latest`，`never`、`no` 不带。`web-v0.9.0` 存在时，`web` 的 `0.1.0` 不移动 `latest`，`1.0.0` 会移动；`v0.9.0` 和 `client-v0.2.0` 不影响页面。新标签打在新提交上，同一提交可以再跑，指向旧提交时失败且标签不动。`v0.1.0` 和 `models` 不会被创建。页面和引擎 Release 使用 `--latest=false`，标题分别是页面镜像和引擎镜像。客户端 `0.1.0` 在已有 `client-v0.2.0` 时用 `--latest=false`，`0.3.0` 用 `--latest`。三份说明里的占位符都已替换。

## 未测试

- 未在 GitHub Actions 上构建镜像或安装包，未向 GitHub 推送标签或创建 Release。
- 未调用本机的 `gh`，`--latest=false` 只在脚本参数里核对过。
- 未启动开发服务器，未在浏览器里打开版本页。
- 未在 macOS 自带的 Bash 3.2 上跑这些脚本。
