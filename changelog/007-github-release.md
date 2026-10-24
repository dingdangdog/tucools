# 007 按版本标签发布安装包和镜像

**日期：** 2026-10-24

## 背景 / 问题

发布 Windows 安装包和 Docker 镜像需要手工构建。需要在推送 `v主版本.次版本.修订号` 标签时读取版本号，自动构建并创建 GitHub Release。

## 变更内容

- 新增 `.github/workflows/release.yml`。标签不满足三位版本号时，工作流在读取版本的步骤失败。
- 页面镜像和引擎镜像构建 `linux/amd64`、`linux/arm64`，推送到 `ghcr.io/<所有者>/tucools-web` 和 `ghcr.io/<所有者>/tucools-engine`，同时更新对应的 `latest`。
- Windows 任务用标签中的版本构建 NSIS x64 安装包。安装包、blockmap 和 SHA256 校验文件附在 Release 上。
- Compose 可用 `TUCOOLS_WEB_IMAGE`、`TUCOOLS_ENGINE_IMAGE` 指向已发布镜像。未设置时仍构建原来的本地镜像名。

## 影响范围

- `.github/workflows/release.yml`
- `deploy/docker-compose.yml`
- `docs/deploy.md`
- `README.md`
- `AGENTS.md`

## 数据库与兼容性

- 无数据库影响。
- 不需要 Docker Hub 密钥。镜像使用工作流里的 `GITHUB_TOKEN`。
- 容器包第一次发布时默认私有，需要在 GitHub Packages 页面改为公开后，其他人才能直接拉取。
- 安装包没有代码签名，也不包含模型包和 `tucools-engine.exe`。
- 本地 `docker compose up --build` 在不设置镜像变量时保持原镜像名。
- 再次推送旧版本标签也会把 `latest` 指向该版本。工作流不会把版本号提交回默认分支。

## 验证

- 已检查工作流 YAML 能被解析。标签正则接受 `v0.2.0`，拒绝 `v1.2`、`v1.2.3-beta` 和带前导零的 `v01.2.3`。
- 未推送标签，未在 GitHub Actions 中运行。
- 未构建 Docker 镜像，未运行 `npm run package:win`。
