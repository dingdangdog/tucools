# 003 模型包独立发布

**日期：** 2026-10-23

## 背景 / 问题

模型文件已经不进 Git，但目录仍分成仓库旁的 `models/` 和 `bin/`，安装包和 Docker 也只靠环境变量约定，用户看不出模型是单独下载的一份发布物。

## 变更内容

- 模型、超分权重和 upscayl 程序收成一个 `model-pack` 目录，由 `TUCOOLS_MODEL_PACK` 指定。
- 安装包过滤权重文件。Docker 镜像只挂载该目录，不再把模型复制进镜像。
- 健康检查和 AI 页面在缺文件时给出模型包目录。
- 文件清单写在 `deploy/model-pack.json`。

## 影响范围

- `services/engine/runtime_info.py`
- `services/engine/app.py`
- `services/engine/vendor/enhance.py`
- `apps/desktop/host.js`
- `apps/desktop/package.json`
- `deploy/Dockerfile.engine`
- `deploy/docker-compose.yml`
- `deploy/model-pack.json`
- `scripts/link-models.ps1`
- `apps/web/src/components/EngineStatus.vue`

## 数据库与兼容性

- 无数据库影响。
- 仍可单独设置 `TUCOOLS_MODELS` 和 `TUCOOLS_UPSCAYL`。未设置时从模型包目录推导。

## 验证

- 用未放置模型包的工作目录调用健康检查，确认路径指向 `model-pack`，且安装包过滤和镜像构建文件都不包含该目录。
