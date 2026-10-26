# 046 macOS 和 Linux 安装包也自带引擎

**日期：** 2026-10-26

## 背景 / 问题

045 只把 Windows 安装包里的引擎冻成程序。macOS 和 Linux 仍打包引擎源码，并要求用户自己准备 Python。

## 变更内容

- macOS 和 Linux 的打包命令先冻结当前系统的引擎，再把 `tucools-engine` 打进安装包，不再放入 Python 源码。
- 已安装的程序在三个平台都只启动随包引擎。找不到时不再调用本机 Python。
- macOS 按本机架构分别打包。发布流程用 `macos-latest` 打 arm64，用 `macos-15-intel` 打 x64。两边的校验文件分开。
- Linux 发布任务安装 Python 3.12 和打包工具后再冻结引擎。
- macOS 的 torch 使用不带 `+cpu` 的轮子，因为该平台的 CPU 索引没有对应文件。

## 影响范围

- `scripts/build-engine.sh`
- `scripts/package-mac.sh`
- `apps/desktop/package.json`
- `apps/desktop/host.js`
- `apps/desktop/host.test.js`
- `.github/workflows/desktop.yml`
- `.github/scripts/publish-desktop-assets.sh`
- `.github/scripts/release-notes.md`
- `docs/deploy.md`
- `AGENTS.md`

## 数据库与兼容性

- 无数据库影响。
- 模型包仍然单独下载。
- 已经发布的 macOS 和 Linux 安装包仍是旧内容，需要重新发布后才会带上引擎程序。

## 验证

- `node --test apps/desktop/host.test.js`：通过。macOS 和 Linux 的安装包选择 `tucools-engine`；没有该程序时不再退回 Python。
- `apps/desktop/package.json` 可以解析。
- `bash -n scripts/build-engine.sh` 和 `bash -n scripts/package-mac.sh`：通过。脚本是 Unix 换行。
- 未在 macOS 或 Linux 上冻结引擎，也未打这两个平台的安装包。发布流程未在 GitHub Actions 上运行。
