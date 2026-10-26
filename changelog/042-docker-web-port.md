# 042 Docker 页面改从 13175 打开

**日期：** 2026-10-26

## 背景 / 问题

开发页默认端口已经是 13175。Docker 仍把页面发布在宿主机 8080，README、开发说明和部署说明还让浏览器打开 `http://127.0.0.1:8080`。

## 变更内容

- `deploy/docker-compose.yml` 和 `deploy/docker-compose.deploy.yml` 的页面端口改为 `13175:8080`。
- README、`develop.md`、`docs/deploy.md` 和 AI 功能说明中的打开地址改为 `http://127.0.0.1:13175`。

## 影响范围

- `deploy/docker-compose.yml`
- `deploy/docker-compose.deploy.yml`
- `README.md`
- `develop.md`
- `docs/deploy.md`
- `docs/2026-10-26-如何使用AI功能.md`

## 数据库与兼容性

- 无数据库影响。
- 容器内 nginx 仍监听 8080，`EXPOSE 8080` 不变。已发布的页面镜像不用重建。
- 已经按 8080 启动的容器要重新创建后，才会从 13175 打开。
- 引擎仍不映射到宿主机，仍监听容器内 8787。安装包仍由本机随机端口提供静态页。

## 验证

- `docker compose -f deploy/docker-compose.yml config` 与 `docker compose -f deploy/docker-compose.deploy.yml config`：宿主机发布端口为 13175，容器目标端口为 8080。
- 未启动容器，未在浏览器打开 13175。

## 未做事项

- 未重新发布页面镜像。
