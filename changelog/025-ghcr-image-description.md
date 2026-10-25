# 025 补上 GitHub 包页面的镜像描述

**日期：** 2026-10-25

## 背景 / 问题

引擎镜像发布成功后，GitHub 包页面仍显示 `No description provided`。页面镜像和引擎镜像都是 `linux/amd64` 与 `linux/arm64` 的多架构清单。包页面读取清单索引上的 `org.opencontainers.image.description`。原来的发布工作流只把来源、版本和修订号写成各架构镜像的标签，索引上没有描述。

## 变更内容

- 发布工作流为页面镜像和引擎镜像增加索引注解，描述分别是「图酷页面」和「图酷图像处理引擎」。来源、版本和修订号也写到同一索引上。
- 两个 Dockerfile 的最终阶段写入相同描述，本地构建后 `docker inspect` 可以看到。
- 推送后读取清单原文，确认索引上有 `org.opencontainers.image.description`，缺失时发布失败。

## 影响范围

- `.github/workflows/release.yml`
- `deploy/Dockerfile.web`
- `deploy/Dockerfile.engine`
- `docs/deploy.md`

## 兼容性

镜像启动方式、标签名和架构不变。已经发布的清单不会被改写。下次推送 `v主版本.次版本.修订号` 标签后，新版本和 `latest` 的包页面才会显示描述。

## 验证

- 未构建或推送镜像。索引注解要等下一次发布，由工作流里的 `docker buildx imagetools inspect` 检查。
- 未测试。
