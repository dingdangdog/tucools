# 019 增加只部署的 Compose

**日期：** 2026-10-24

## 背景 / 问题

已有 `deploy/docker-compose.yml` 带本地 `build`。服务器上只想拉取已发布镜像并启动时，这条文件仍可能在镜像不存在时回退到构建。

## 变更内容

- 新增 `deploy/docker-compose.deploy.yml`。没有 `build`，默认拉取 `ghcr.io/dingdangdog/tucools-web` 和 `ghcr.io/dingdangdog/tucools-engine`。
- 可用 `TUCOOLS_VERSION` 指定不带 `v` 的版本，或用 `TUCOOLS_WEB_IMAGE`、`TUCOOLS_ENGINE_IMAGE` 覆盖完整镜像名。
- 页面仍发布 `8080`。引擎不映射到宿主机，页面容器在引擎健康检查通过后启动。
- 从源码构建继续使用原来的 `deploy/docker-compose.yml`。

## 影响范围

- `deploy/docker-compose.deploy.yml`
- `docs/deploy.md`
- `README.md`
- `AGENTS.md`

## 数据库与兼容性

- 无数据库影响。
- 原构建用 Compose、端口、模型包卷和页面环境变量不变。新文件的项目名是 `tucools`，与目录名 `deploy` 不是同一组容器。

## 验证

- `docker compose -f deploy/docker-compose.deploy.yml config`：通过。默认镜像为 `ghcr.io/dingdangdog/tucools-web:latest` 和 `ghcr.io/dingdangdog/tucools-engine:latest`，没有 `build`。设置 `TUCOOLS_VERSION=0.2.0` 后，镜像标签变为 `0.2.0`。
- 未执行 `docker compose pull` 或 `up`，未在浏览器打开部署结果。
