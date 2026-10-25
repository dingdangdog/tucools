# 023 amd64 引擎镜像使用宿主机 NVIDIA GPU

**日期：** 2026-10-25

## 背景 / 问题

引擎镜像只安装 CPU 版 torch 和 onnxruntime，Compose 也没有把宿主机显卡传进容器。消除请求固定走 CPU 时，即使机器有 NVIDIA GPU 也不会使用。

## 变更内容

- `linux/amd64` 引擎镜像改为 CUDA 12.8 基础镜像，安装 `requirements-gpu.txt` 里的 `torch==2.7.1+cu128`、`torchvision==0.22.1+cu128` 和 `onnxruntime-gpu==1.22.0`。
- `linux/arm64` 继续安装 `requirements.txt` 的 CPU 依赖。
- 新增 `deploy/docker-compose.gpu.yml`。和原来的 Compose 叠在一起时，引擎容器使用宿主机全部 NVIDIA GPU。
- 容器能看到 CUDA 时，消除改走 `auto`，抠图使用 CUDA 执行提供程序；`nvidia-smi` 可用时，优化给 `upscayl-bin` 传入 `-g 0`，否则传入 `-g -1`。
- 页面在有引擎时提交 `device=auto` 和 `gpu=true`。显卡不可用时仍回退到 CPU。

## 影响范围

- `deploy/Dockerfile.engine`
- `deploy/docker-compose.gpu.yml`
- `services/engine/requirements-gpu.txt`
- `services/engine/requirements.txt`
- `services/engine/app.py`
- `services/engine/vendor/cutout.py`
- `services/engine/vendor/enhance.py`
- `apps/web/src/pages/CutoutPage.vue`
- `apps/web/src/pages/EnhancePage.vue`
- `apps/web/src/pages/ErasePage.vue`
- `docs/deploy.md`
- `.github/workflows/release.yml`
- `AGENTS.md`

## 数据库与兼容性

- 无数据库影响。
- 本机 `npm run engine` 和 Windows 安装包仍使用 CPU 依赖。
- arm64 镜像的依赖版本不变。
- amd64 镜像变大，宿主机驱动需要支持 CUDA 12.8。没有 NVIDIA Container Toolkit 时不能叠加 `docker-compose.gpu.yml`。
- 没有显卡时，消除、抠图和优化继续用 CPU。

## 验证

- 用 pip 26.2.2 按 Debian bookworm 的 `linux/amd64` 标签、CPython 3.11，对 `requirements-gpu.txt` 做 `--dry-run`。解析成功，结果包含 `onnxruntime-gpu-1.22.0`、`torch-2.7.1+cu128` 和 `torchvision-0.22.1+cu128`。
- 对改过的 Python 文件做语法检查，通过。
- 未构建 Docker 镜像，未在带 NVIDIA GPU 的机器上运行容器。
