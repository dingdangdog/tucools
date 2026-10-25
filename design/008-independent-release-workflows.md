# 分开发布镜像和安装包

## 1. 背景与目标

- 当前问题：推送 `vX.Y.Z` 会在同一次运行里构建页面镜像、引擎镜像和 Windows 安装包。引擎镜像包含 CUDA，并且还要模拟 `linux/arm64`，一次发布就要等最慢的那一项。页面或安装包单独改动时，也得把引擎重新打一遍。
- 目标用户与场景：维护者按改动范围选择发布内容，并让 Windows、macOS、Linux 安装包同时构建。
- 成功标准：推送标签不再触发构建。页面镜像、引擎镜像、三个桌面平台可以同时运行。一个平台失败不取消其他平台，也不挡住另一类产物。GitHub Release 和 GHCR 坐标仍按同一个版本号对齐。
- 非目标：不做代码签名和 macOS 公证。不做 Linux arm64 安装包。不把模型包或 `tucools-engine.exe` 打进安装包。不把 `linux/amd64` 与 `linux/arm64` 拆成两个构建再合并清单。不在标签推送时自动创建空 Release。

## 2. 现状与约束

- 现有架构、组件和数据源：同一份 `apps/web` 给 Docker 和 Electron 使用。镜像定义在 `deploy/Dockerfile.web` 和 `deploy/Dockerfile.engine`。安装包配置在 `apps/desktop/package.json`。旧入口是 `.github/workflows/release.yml`，由标签推送触发，Release 要等镜像和 Windows 都成功。
- 技术、兼容、安全、合规和发布约束：引擎只留在 Compose 网络内。镜像和安装包不含模型包。GHCR 使用 `GITHUB_TOKEN`。多架构清单索引上的 `org.opencontainers.image.description` 决定 GitHub 包页面描述。`npmRebuild` 必须保持 `false`。Electron 版本必须是固定版本。
- 已知历史问题：工作区依赖提升会导致 electron-builder 在 `apps/desktop` 下执行 `npm install --production` 并删掉 `app-builder`。Windows 安装包任务已经用 `npmRebuild: false` 避开。macOS 和 Linux 沿用同一设置。

## 3. 方案概览

版本的唯一身份是已经推送的 git 标签 `vX.Y.Z`。标签只标记提交。构建由三个手动工作流发起，共享同一套版本校验脚本：标签必须存在，且必须指向这次选中的提交。工作流不创建、不移动标签。

页面镜像和引擎镜像各有一个入口，内部调用同一份构建实现。安装包是一个入口、三个互不依赖的任务，默认一起开始，也可以只勾选其中一个。谁先成功，谁就为这个已有标签创建 Release；之后的任务只上传自己的附件，不改写说明。

## 4. 详细设计

### 4.1 数据模型与权威来源

- 版本号来自标签名，或来自手动填写且与该标签一致的 `X.Y.Z`。
- 镜像坐标由仓库所有者小写名推导：`ghcr.io/<所有者>/tucools-web` 和 `ghcr.io/<所有者>/tucools-engine`。
- `latest` 不是版本身份。默认 `auto`：存在更高的 `vX.Y.Z` 标签时不移动 `latest`。
- 安装包文件名带平台和架构：`图酷-<版本>-windows-x64.exe`、`图酷-<版本>-mac-<arch>.dmg`、`图酷-<版本>-linux-x64.AppImage` 和同名 deb。
- 校验文件按平台分开：`SHA256SUMS-windows.txt`、`SHA256SUMS-macos.txt`、`SHA256SUMS-linux.txt`。
- 镜像摘要是 `tucools-web-<版本>.txt` 和 `tucools-engine-<版本>.txt`。Release 说明不写 digest，避免多个任务改写同一段正文。

### 4.2 API、权限与错误语义

- 三个入口都是 `workflow_dispatch`，没有 `push` 触发。
- 镜像工作流权限是 `contents: write` 和 `packages: write`。安装包工作流只有 `contents: write`。
- 版本不符合三位数字、标签不存在、标签指向别的提交、一个平台都没选：任务失败并写明原因。
- 镜像推送后读取清单索引。没有 `org.opencontainers.image.description` 则失败。
- 不涉及应用内 API。

### 4.3 状态、缓存、并发与幂等

- 并发组按产物和版本分开：`image-web-*`、`image-engine-*`、`desktop-*`。同一产物的第二次运行排队，不取消正在进行的构建。三类产物可以同时跑。
- 安装包的三个任务没有 `needs`。`if` 只控制要不要跑。未勾选任何平台时，单独的检查任务失败，平台任务本身不会启动。
- 构建缓存仍用 `tucools-web` 和 `tucools-engine`，与原来的缓存范围相同。
- 重复上传使用 `gh release upload --clobber`，只替换同名附件。
- Release 说明只在不存在时创建。并发创建时，失败的一方确认 Release 已经存在后继续上传。

### 4.4 UI、交互与信息架构

不涉及页面信息架构。Actions 里能直接运行的名称是「发布页面镜像」「发布引擎镜像」「发布安装包」。内部复用的镜像构建文件不能单独运行。

macOS 上关闭窗口不退出进程，再次点 Dock 图标会打开原来的地址。退出时才停止本机页面服务和引擎子进程。

### 4.5 国际化、主题与响应式

不涉及新文案键。安装包仍在第一次打开且没有保存语言时按系统语言选择。

### 4.6 日志、审计、隐私与安全

- 手动运行限于有仓库写权限的人。
- 不读取 `.env`，不把模型包放进构建上下文。
- 安装包统一关闭证书自动发现，不签名。
- 脚本不打印 `GH_TOKEN`。

## 5. 失败与恢复

- 外部依赖失败：某个平台或某个镜像失败时，其他任务继续。修复后只重跑失败的工作流；安装包可以只勾选失败的平台，或使用 Re-run failed jobs。
- 部分成功：Release 上可以暂时只有 Windows 附件，或只有镜像摘要。说明里写明「附件还没有出现就是对应任务还没完成」。
- 重试与幂等：同一标签、同一提交可以重复发布。同名附件被覆盖。`latest` 在 `auto` 下不会被更旧的版本覆盖。
- 用户恢复路径：维护者看 Actions 摘要和 Release 附件。下载方看对应平台的 `SHA256SUMS-*.txt`。

## 6. 兼容与数据处理

- 存量数据：已发布的旧 Release、旧镜像标签不改写。Windows 新文件名不再使用 `图酷-Setup-<版本>.exe`。
- 旧客户端/旧 URL/旧缓存：Compose 的 `TUCOOLS_VERSION`、`TUCOOLS_WEB_IMAGE`、`TUCOOLS_ENGINE_IMAGE` 不变。
- 不涉及数据库。
- 回滚边界：把默认分支上的工作流换回旧文件才能恢复「推送标签即全量构建」。已经发出的 GHCR 标签需要重新运行对应镜像工作流才会变化。

## 7. 实施顺序

1. 抽出版本校验、`latest` 判断、Release 创建和附件上传脚本。
2. 用两个手动入口加一份内部镜像构建，替换标签触发的 `release.yml`。保留索引描述注解和推送后的描述检查。
3. 安装包入口拆成三个并行任务，并补上 macOS、Linux 的 electron-builder 目标。
4. 安装包里的模型目录和 Python 命令按系统区分。Windows 的 `%APPDATA%\tucools\model-pack` 保持不变。
5. 更新部署说明、设计记录和变更记录。

## 8. 验证与验收

- 自动化检查：shell 语法、版本号拒绝样例、`latest=yes|no` 的标签输出、说明模板替换、YAML 可解析、`node --check`、模型目录和 Python 命令的平台分支。
- 边界与回归用例：更高版本标签存在时 `auto` 不移动 `latest`；标签指向别的提交时拒绝；三个校验文件名不冲突。
- 人工或外部服务：未在 GitHub Actions 上实际构建镜像或安装包。未做代码签名。macOS 临时签名和 Linux AppImage 要等第一次手动运行确认。
- 发布前检查：默认分支已包含新工作流；标签指向的提交也包含这些文件；Packages 的可见性仍按原规则处理。

## 9. 风险与待决策

| 项目 | 影响 | 建议 | 决策状态 |
| --- | --- | --- | --- |
| macOS 没有 Developer ID | 用户第一次打开需要到系统设置里允许 | 说明写进 Release 和 `docs/deploy.md`。不引入证书 | 已按不签名实施 |
| Linux 只做 x64 | arm64 桌面用户没有安装包 | 服务器继续用 arm64 引擎镜像 | 已实施 |
| 引擎镜像仍在一个任务里构建两个架构 | 引擎发布本身仍然慢 | 慢的成本只在引擎工作流里，不再挡住页面和安装包 | 已实施 |
| Release 说明第一次写入后不更新 | 后续改说明模板不会刷新旧 Release | 需要时在 GitHub 上手工改说明 | 已实施 |
