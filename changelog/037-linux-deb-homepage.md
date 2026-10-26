# 037 给 Linux deb 补上项目主页

**日期：** 2026-10-26

## 背景 / 问题

Linux 安装包任务在生成 AppImage 之后、构建 deb 时失败：`Please specify project homepage`。electron-builder 25.1.8 的 fpm 目标要求项目主页。`apps/desktop/package.json` 没有 `homepage`，也没有 `repository`。它只在 `apps/desktop/.git/config` 查找 `origin`，不会使用仓库根目录的 Git 远程或 `GITHUB_REPOSITORY`。

## 变更内容

- 在 `@tucools/desktop` 的 `package.json` 写入 `homepage`：`https://github.com/dingdangdog/tucools`。
- 部署说明写明 deb 依赖这个字段，以及 electron-builder 不会从仓库根目录推断主页。

## 影响范围

- `apps/desktop/package.json`
- `docs/deploy.md`

## 数据库与兼容性

- 无数据库影响。
- AppImage、Windows NSIS 和 macOS 安装包的目标不变。deb 的 Homepage 字段变为上述仓库地址。
- 准备桌面构建的步骤只改 `version`，不会清掉 `homepage`。

## 验证

- 用本机的 `app-builder-lib@25.1.8` 调用 `AppInfo.computePackageUrl()`，确认返回 `https://github.com/dingdangdog/tucools`。
- 未在 Linux 上运行 `npm run package:linux`，未重新触发 GitHub Actions。
