# 027 去掉引擎镜像里重复的 CUDA 基础镜像

**日期：** 2026-10-25

## 背景 / 问题

`linux/amd64` 引擎镜像使用 `nvidia/cuda:12.8.1-cudnn-runtime-ubuntu22.04`。这层基础镜像解压后约 4.45GB，里面已有 CUDA 12.8 和 cuDNN。`torch==2.7.1+cu128` 又会安装一套相同的 CUDA 库，`onnxruntime-gpu` 也要链接它们。模型包本来就不在镜像里，体积主要来自这两套运行库叠在一起。

## 变更内容

- amd64 改为 `python:3.11-slim-bookworm`，继续安装 `requirements-gpu.txt`。
- 构建时把 torch 附带的 `nvidia/*/lib` 写入动态链接器配置并执行 `ldconfig`，抠图的 CUDA 执行提供程序仍能找到 cuDNN 和 cuBLAS。
- 保留 `libvulkan1`，以及 `NVIDIA_DRIVER_CAPABILITIES=compute,utility,graphics`。优化的 Vulkan 程序和宿主机驱动注入方式不变。
- 不再安装 deadsnakes 的 Python，也不再套一层虚拟环境。arm64 仍安装 CPU 依赖。

## 影响范围

- `deploy/Dockerfile.engine`
- `services/engine/requirements-gpu.txt`
- `docs/deploy.md`
- `.github/scripts/release-notes.md`

## 兼容性

- 依赖版本不变。消除仍用 PyTorch CUDA，抠图仍用 ONNX Runtime GPU，优化仍用模型包里的 `upscayl-bin`。
- 宿主机驱动仍需支持 CUDA 12.8，并安装 NVIDIA Container Toolkit。没有显卡时不要叠加 `docker-compose.gpu.yml`。
- 镜像仍然有数 GB，因为 CUDA 版 torch 及其 NVIDIA 库必须留下。去掉的是重复的那层 CUDA 基础镜像。
- 已发布的镜像不会变小，下次构建引擎镜像才生效。

## 验证

- 未构建 Docker 镜像，未在带 NVIDIA GPU 的机器上运行容器。
