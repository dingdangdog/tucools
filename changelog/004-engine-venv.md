# 004 引擎启动使用虚拟环境

**日期：** 2026-10-24

## 背景 / 问题

本机 `py -3` 指向 Python 3.14。引擎依赖装在 Python 3.12 的 `.venv` 里，`npm run engine` 仍调用 `py -3`，因此报 `No module named uvicorn`。

## 变更内容

- `npm run engine` 改为调用仓库根目录 `.venv/Scripts/python.exe`。
- 桌面开发启动 Python 引擎时，若存在该虚拟环境则优先使用。
- 安装说明改为用 Python 3.12 创建 `.venv` 再安装依赖。
- 打包脚本改为使用同一个虚拟环境解释器。

## 影响范围

- `package.json`
- `apps/desktop/host.js`
- `scripts/build-engine.ps1`
- `README.md`
- `docs/deploy.md`
- `AGENTS.md`

## 数据库与兼容性

- 无数据库影响。
- 未创建 `.venv` 时，桌面壳仍回退到 `py -3`。`npm run engine` 需要先按 README 创建虚拟环境。
- 设置 `TUCOOLS_PYTHON` 时仍使用该解释器。

## 验证

- `npm run engine` 已用 `.venv` 启动，`http://127.0.0.1:8787/api/engine/health` 返回 `ok: true`。
- 未运行 `scripts/build-engine.ps1`。
