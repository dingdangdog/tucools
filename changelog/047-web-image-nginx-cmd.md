# 047 页面镜像写上 nginx 启动命令

**日期：** 2026-10-26

## 背景 / 问题

`deploy/Dockerfile.web` 只设置了 `ENTRYPOINT ["/web-entrypoint.sh"]`。Docker 在子镜像改写 `ENTRYPOINT` 时会清掉基础镜像的 `CMD`。已发布的 `ghcr.io/dingdangdog/tucools-web:0.0.2` 和 `0.0.7` 都是 `Cmd=null`。容器跑完入口脚本后没有 nginx 进程，以退出码 0 结束。compose 使用 `restart: unless-stopped` 时会立刻再拉起，看起来像无限重启，日志里没有报错。

## 变更内容

- `deploy/Dockerfile.web` 增加 `CMD ["nginx", "-g", "daemon off;"]`。
- `deploy/web-entrypoint.sh` 在没有参数时补上同一条命令。
- `docs/deploy.md` 写明已发布的 `0.0.7` 及更早镜像仍要重新发布，或在 compose 里临时加上 `command`。

## 影响范围

- `deploy/Dockerfile.web`
- `deploy/web-entrypoint.sh`
- `docs/deploy.md`

## 数据库与兼容性

- 无数据库影响。
- 已发布的页面镜像不会因为这次源码改动而改变。`0.0.7` 仍需在 compose 中写 `command: ["nginx", "-g", "daemon off;"]`，或重新发布页面镜像后再去掉这行。
- 显式传入其他命令时，入口脚本仍把该命令交给 nginx 的入口，不会改成默认的前台 nginx。

## 验证

- `docker inspect ghcr.io/dingdangdog/tucools-web:0.0.7`：`Cmd=null`。不带命令运行该镜像，进程立即以退出码 0 结束。
- 用同一镜像加上 `nginx -g "daemon off;"`，并挂载 `E:\docker\tucools\nginx.conf`：nginx 1.27.5 保持运行。诊断容器已停止并删除。
- 未重新构建页面镜像，未发布新标签。

## 未做事项

- 未重新构建或发布页面镜像。
