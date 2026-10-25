# 021 固定 Windows 安装包使用的 Electron 版本

**日期：** 2026-10-25

## 背景 / 问题

推送版本标签后，Windows 安装包任务在 `electron-builder` 处失败：`apps/desktop/node_modules` 里没有 Electron，依赖版本又是 `^35.7.5`。npm workspaces 把 `electron` 安装到仓库根目录，electron-builder 不会向上查找；版本以 `^` 开头时，它无法决定要下载哪一个 Electron。

## 变更内容

- `@tucools/desktop` 的 `electron` 改为固定版本 `35.7.5`，并在 `build.electronVersion` 写入同一版本。
- 补上 `description`，避免安装包元数据缺少说明。
- 锁文件中的工作区依赖声明改为同一固定版本。

## 影响范围

- `apps/desktop/package.json`
- `package-lock.json`
- `docs/deploy.md`
- `AGENTS.md`

## 数据库与兼容性

- 无数据库影响。
- 安装包仍使用 Electron 35.7.5，与当前锁文件解析结果相同。
- 升级 Electron 时，`devDependencies.electron` 和 `build.electronVersion` 要一起改成同一个不带范围符号的版本。

## 验证

- 在本机调用 electron-builder 的版本解析，确认 `apps/desktop` 得到 `35.7.5`。
- 未运行完整的 NSIS 打包，未重新推送版本标签。
