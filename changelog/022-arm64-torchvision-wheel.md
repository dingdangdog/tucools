# 022 分开安装 arm64 的 torchvision 轮子

**日期：** 2026-10-25

## 背景 / 问题

发布工作流同时构建 `linux/amd64` 和 `linux/arm64` 引擎镜像。amd64 能安装 `torchvision==0.22.1+cpu`，arm64 不能：PyTorch CPU 源里的 aarch64 文件是 `torchvision-0.22.1-cp311-cp311-manylinux_2_28_aarch64.whl`，版本号不带 `+cpu`。pip 因此报 `No matching distribution found for torchvision==0.22.1+cpu`。同一源里的 `torch==2.7.1+cpu` 有 aarch64 轮子，所以失败只出在 torchvision。

本机之前的安装和 amd64 镜像构建都走带 `+cpu` 的轮子，不会碰到这条 arm64 文件名差异。

## 变更内容

- `torch` 仍固定为 `2.7.1+cpu`。
- `x86_64` 和 Windows `AMD64` 继续安装 `torchvision==0.22.1+cpu`。
- `aarch64` 和 `arm64` 安装 `torchvision==0.22.1`。

## 影响范围

- `services/engine/requirements.txt`
- `deploy/Dockerfile.engine` 仍安装这份依赖，没有改构建步骤。
- `docs/deploy.md`
- `AGENTS.md`

## 数据库与兼容性

- 无数据库影响。
- amd64 与 Windows 的 torch、torchvision 版本不变。
- arm64 的 torchvision 仍是 0.22.1，对应 torch 2.7.1，只是轮子文件名没有 `+cpu`。

## 验证

- 用 pip 26.2.2 解析 `services/engine/requirements.txt` 的环境标记：Windows `AMD64` 和 `x86_64` 选中 `torchvision==0.22.1+cpu`；`aarch64` 和 `arm64` 选中 `torchvision==0.22.1`。
- 按 Debian bookworm 能安装的 aarch64 平台标签、CPython 3.11，对 arm64 会选中的整份依赖做 `--dry-run`。解析成功，其中包含 `numpy-2.2.6`、`torch-2.7.1+cpu`、`torchvision-0.22.1`。
- 未构建 Docker 镜像，未重新推送版本标签。
