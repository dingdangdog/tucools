# 045 Windows 安装包自带引擎

**日期：** 2026-10-26

## 背景 / 问题

Windows 安装包只复制了引擎的 Python 源码，没有 `tucools-engine.exe`。安装后的程序找不到仓库里的 `.venv`，就去调用系统 Python。系统 Python 没有 uvicorn 等依赖，进程马上退出。页面请求 `/api/engine/health` 失败，于是显示「引擎没有响应。请先启动本机引擎或 Docker 中的引擎。」模型是否已经下载，不改变这句提示。

## 变更内容

- `scripts/build-engine.ps1` 用仓库 `.venv` 把引擎冻成目录形式的 `tucools-engine.exe`，并确认结果里没有引擎源码。
- Windows 安装包改为放入这个冻结目录，不再放入 `services/engine` 的 `.py` 文件。`npm run package:win` 会先执行冻结。
- 已安装的 Windows 程序只启动随包的 `tucools-engine.exe`。找不到时不再调用本机 Python。
- 引擎的临时文件和 `engine.log` 写到用户数据目录，避免安装目录不可写。
- 客户端在引擎刚启动的约一分钟内显示「正在启动本机引擎」，超时后不再提示用户自己去启动 Docker。
- macOS 和 Linux 安装包仍带引擎源码，并用本机 Python 运行。
- 发布流程的 Windows 任务会先安装引擎依赖再打包。

## 影响范围

- `services/engine/entry.py`
- `services/engine/tucools-engine.spec`
- `scripts/build-engine.ps1`
- `apps/desktop/host.js`
- `apps/desktop/host.test.js`
- `apps/desktop/package.json`
- `apps/web/src/components/EngineStatus.vue`
- `apps/web/src/content/`
- `docs/deploy.md`
- `AGENTS.md`
- `.github/workflows/desktop.yml`
- `.github/scripts/release-notes.md`

## 数据库与兼容性

- 无数据库影响。
- 模型包仍单独放在 `%APPDATA%\tucools\model-pack`，不进安装包。
- 已经装上的旧客户端没有随包引擎，需要用新的安装包重新安装。
- 开发时的 `npm run dev:desktop` 和 `npm run engine` 仍使用仓库 `.venv`。

## 验证

- `node --test apps/desktop/host.test.js`：通过。已安装的 Windows 选择随包程序；没有该程序时不再退回 Python；开发模式仍选择仓库里的引擎目录。
- `npm run typecheck`：通过。
- `services/engine/entry.py` 语法检查通过。`.venv` 可以导入冻结所需的依赖。
- `scripts/build-engine.ps1` 生成 `services/engine/dist/tucools-engine/tucools-engine.exe`。目录约 1.6 GB，顶层只有这个程序和 `_internal`。其中没有 `app.py`、`entry.py`、`jobs.py`、`runtime_info.py`。
- 单独启动该程序并请求 `http://127.0.0.1:8791/api/engine/health`：返回 200，`ok` 为 true。空模型目录时各功能为未就绪。进程随后已结束。
- 本机打出 `apps/desktop/release/TuCools-0.1.0-windows-x64.exe`，约 384 MB。解包目录 `resources\engine` 里有 `tucools-engine.exe` 和 `_internal`，没有 `app.py`、`entry.py` 或 `vendor`。
- 未把新安装包安装到 `D:\Program Files\tucools`。当前已经装上的旧客户端不会因此改变。
- 未在 GitHub Actions 上运行。打包时从 GitHub 重新下载 Electron 35.7.5 没有完成，安装包使用的是本机已有的同一版本 Electron。
