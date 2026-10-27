# 056 仓库首页改为英文，并提供中文

**日期：** 2026-10-27

## 背景 / 问题

GitHub 默认展示 `README.md`，原先整篇是中文。安装、Docker 和模型包的步骤都在，但没有语言切换，结构和仓库里另一份面向使用者的首页也不一致。AI 功能说明里的 Docker 地址仍写着 `8080`，和现在的 `13175` 不一致。

## 变更内容

- `README.md` 改为英文，作为默认首页。
- 新增 `README.zh-CN.md`。两篇顶部互相链接，当前语言加粗。
- 两篇都按同一顺序写：简介、示例、功能、客户端、Docker、模型、语言、开发和文档。
- `docs/2026-10-26-如何使用AI功能.md` 的打开地址改为 `http://127.0.0.1:13175`。

## 影响范围

- `README.md`
- `README.zh-CN.md`
- `docs/2026-10-26-如何使用AI功能.md`

## 数据库与兼容性

- 无数据库影响。
- 安装包文件名、模型目录、端口和引擎契约不变。
- 仓库没有 `LICENSE`，首页不写许可证。

## 验证

- 对照 `apps/web/src/content/en.ts`、`zh.ts` 的工具名，以及 `services/engine/runtime_info.py` 的模型文件名。
- 对照 `deploy/docker-compose.deploy.yml` 的镜像名和 `docs/deploy.md` 的 `13175`。
- 未在 GitHub 上预览徽章和语言切换。未启动页面、Docker 或安装包。

## 未做事项

- 未把 `docs/` 里的其余说明改成英文。
