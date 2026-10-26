# 043 镜像 latest 选项不再使用 yes/no

**日期：** 2026-10-26

## 背景 / 问题

运行「发布页面镜像」时，`latest` 的下拉选项显示 `true` 和 `false`，提交后又提示只能是 `yes` 或 `no`。工作流把选项写成了未加引号的 `yes`、`no`。GitHub 的运行表单会把这两个词当成布尔值，脚本仍按字符串 `yes`、`no` 校验。

## 变更内容

- 页面镜像和引擎镜像的 `latest` 选项改为 `auto`、`always`、`never`。
- 标签脚本把 `true`、`yes` 当作 `always`，把 `false`、`no` 当作 `never`。

## 影响范围

- `.github/workflows/image-web.yml`
- `.github/workflows/image-engine.yml`
- `.github/workflows/image-reusable.yml`
- `.github/scripts/image-tags.sh`
- `docs/deploy.md`
- `design/008-independent-release-workflows.md`

## 数据库与兼容性

- 无数据库影响。
- 表单定义来自默认分支。推到 `main` 之后，Actions 里才会出现 `auto`、`always`、`never`。
- 从旧标签运行时，执行的仍是该标签里的脚本。旧脚本只接受 `auto`、`yes`、`no`。
- 镜像坐标、`auto` 的比较规则和安装包工作流不变。

## 验证

- `bash -n .github/scripts/image-tags.sh`。
- 用临时输出文件调用标签脚本：`always`、`yes`、`true` 包含 `latest`；`never`、`no`、`false` 不包含；非法值退出码为 1。
- 未在 GitHub Actions 中打开运行表单，未构建镜像。

## 未做事项

- 未把这次修改推到 `main`。未重跑发布任务。
