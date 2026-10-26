# 038 发布附件使用 TuCools 文件名

**日期：** 2026-10-26

## 背景 / 问题

GitHub Release 上的安装包显示为 `-0.0.4-mac-arm64.dmg`。构建时文件名是 `图酷-0.0.4-mac-arm64.dmg`。GitHub 保存附件时去掉非 ASCII 字符，中文产品名被删掉，连字符还留在开头。

## 变更内容

- Windows、macOS、Linux 的 `artifactName` 改为 `TuCools-<版本>-<平台>-<架构>`。
- 发布说明、README 和部署说明改用同一组文件名。Linux 的 AppImage 写明 `x86_64`，deb 写明 `amd64`。
- 安装后的 `productName` 仍是「图酷」。

## 影响范围

- `apps/desktop/package.json`
- `.github/scripts/release-notes.md`
- `README.md`
- `docs/deploy.md`
- `design/008-independent-release-workflows.md`

## 数据库与兼容性

- 无数据库影响。
- 已经上传的无名前缀附件不会被这次修改改名。同一次 Release 再次上传时，新文件名不会覆盖旧的 `-0.0.4-...` 附件。
- 窗口标题、开始菜单和应用程序名仍是「图酷」。

## 验证

- 用 `app-builder-lib@25.1.8` 展开 `artifactName`，得到 `TuCools-0.1.0-windows-x64.exe`、`TuCools-0.1.0-mac-arm64.dmg`、`TuCools-0.1.0-mac-x64.dmg`、`TuCools-0.1.0-linux-x86_64.AppImage`、`TuCools-0.1.0-linux-amd64.deb`。本地 `package.json` 版本是 `0.1.0`；发布工作流会把它改成标签版本。
- 未重新构建安装包，未向 GitHub Release 上传文件。
