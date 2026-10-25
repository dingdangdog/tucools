# 026 分开构建镜像和三个平台的安装包

**日期：** 2026-10-25

## 背景 / 问题

推送 `vX.Y.Z` 会在同一次运行里构建页面镜像、引擎镜像和 Windows 安装包。引擎镜像最慢，页面或安装包的改动也要等它。安装包只有 Windows。

## 变更内容

- 删除由标签推送触发的 `.github/workflows/release.yml`。推送标签不再构建。
- 新增三个手动工作流：`发布页面镜像`、`发布引擎镜像`、`发布安装包`。前两个共用内部的镜像构建。安装包里的 Windows、macOS、Linux 是三个互不依赖的任务，默认同一次运行里一起开始，也可以只勾选一个。
- 版本必须是已推送的 `vX.Y.Z`，并且指向这次选中的提交。工作流不创建、不移动标签。
- `latest` 默认只在没有更高版本标签时移动。可以强制移动或不移动。
- 镜像索引仍写入 `org.opencontainers.image.description`，推送后没有描述则失败。
- 安装包增加 macOS dmg/zip（arm64、x64）和 Linux x64 AppImage/deb。文件名改为 `图酷-<版本>-<平台>-<架构>`。三个平台各写自己的 SHA256 文件。
- 已安装程序的模型目录：Windows 仍是 `%APPDATA%\tucools\model-pack`；macOS 使用 `~/Library/Application Support/tucools/model-pack`；Linux 使用 XDG 数据目录。macOS 和 Linux 上的 Python 命令改为 `python3`，也可用 `TUCOOLS_PYTHON`。
- macOS 关闭最后一个窗口后不退出，再次点 Dock 会重新打开。

## 影响范围

- `.github/workflows/image-web.yml`
- `.github/workflows/image-engine.yml`
- `.github/workflows/image-reusable.yml`
- `.github/workflows/desktop.yml`
- `.github/workflows/release.yml`（删除）
- `.github/scripts/`
- `.github/actions/prepare-desktop/action.yml`
- `apps/desktop/package.json`
- `apps/desktop/main.js`
- `apps/desktop/host.js`
- `apps/desktop/build/icon.png`
- `package.json`
- `docs/deploy.md`
- `docs/models.md`
- `develop.md`
- `README.md`
- `AGENTS.md`
- `design/008-independent-release-workflows.md`

## 数据库与兼容性

- 无数据库影响。
- 已发出的 Release 和镜像不会被改写。新的 Windows 附件不再叫 `图酷-Setup-<版本>.exe`。
- Compose 的 `TUCOOLS_VERSION`、`TUCOOLS_WEB_IMAGE`、`TUCOOLS_ENGINE_IMAGE` 不变。
- 安装包仍不签名，不含模型包，不含 `tucools-engine.exe`。
- 重发旧版本时，默认不会把镜像 `latest` 退回该旧版本。

## 验证

- `bash -n` 检查 `.github/scripts` 下的脚本。
- 用非法版本号调用版本解析，确认在访问远程标签前失败；`v1.2`、`v1.2.3-beta`、`01.2.0` 被拒绝，`v0.3.0` 会去掉前缀。
- `latest=yes` 和 `latest=no` 的标签输出符合预期。存在更高标签 `v0.9.0` 时，`auto` 发布 `0.3.0` 不包含 `latest`；发布 `1.0.0` 时包含。
- 说明模板中的版本和镜像名会被替换。
- 用 Node 解析四个工作流和复合 action 的 YAML。
- `node --check` 检查 `apps/desktop/main.js` 和 `apps/desktop/host.js`。
- 在本机调用 `modelPackDir`、`pythonCommand`：Windows 已安装路径仍在 `%APPDATA%\tucools\model-pack`；模拟 darwin 和 linux 时路径分别落到 Application Support 和 XDG。未打包时仍读仓库里的 `model-pack`。`TUCOOLS_MODEL_PACK` 优先。
- `icon.png` 为 1024×1024。
- 未在 GitHub Actions 中运行。未构建 Docker 镜像。未运行 `npm run package:win`、`package:mac`、`package:linux`。

## 未做事项

- 未做代码签名、macOS 公证和 Linux arm64 安装包。
- 未把引擎镜像的 amd64 与 arm64 拆成两个并行构建。
