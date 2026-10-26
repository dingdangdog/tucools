# 047 macOS x64 安装包改用 torch 2.2.2

**日期：** 2026-10-26

## 背景 / 问题

macOS x64 安装包在 GitHub Actions 的 `macos-15-intel` 上执行 `scripts/build-engine.sh`。脚本对所有 macOS 都安装 `torch==2.7.1` 和 `torchvision==0.22.1`。PyPI 上 macOS x86_64 的 torch 只有 2.2.0、2.2.1 和 2.2.2，因此 pip 报 `No matching distribution found for torch==2.7.1`。PyTorch 从 2.3 起只发布 macOS arm64 轮子。

torch 2.2.2 不能在 numpy 2 下导入。`opencv-python-headless==4.12.0.88` 要求 numpy 2，SciPy 1.18 也要求 numpy 2。Intel 路径需要一整组仍有 macOS x86_64 轮子、且能与 numpy 1.26.4 共存的版本。

## 变更内容

- `requirements.txt` 按系统和架构选择依赖。Apple 芯片、Linux 和 Windows 仍使用 torch 2.7.1 与 numpy 2.2.6。
- macOS x86_64 安装 torch 2.2.2、torchvision 0.17.2、numpy 1.26.4、opencv-python-headless 4.10.0.84、SciPy 1.17.1、numba 0.62.1 和 tifffile 2026.3.3。2026.4 及以后的 tifffile 要求 numpy 2。
- `build-engine.sh` 在 macOS 上不再写死 torch 2.7.1，只去掉没有 macOS 文件的 CPU 索引，然后按上面的环境标记安装。

## 影响范围

- `services/engine/requirements.txt`
- `scripts/build-engine.sh`
- `docs/deploy.md`
- `AGENTS.md`
- Linux 镜像和 Windows 安装包选中的 torch、torchvision、numpy、OpenCV 版本不变。
- 已发布的 macOS x64 安装包需要重新构建后才会带上引擎程序。

## 数据库与兼容性

- 无数据库影响。
- 消除仍加载模型包里的 `big-lama.pt`。未在 Intel Mac 上用 torch 2.2.2 加载该文件。

## 验证

- 用环境标记解析 `requirements.txt`：Darwin x86_64 选中 torch 2.2.2、torchvision 0.17.2、numpy 1.26.4、opencv-python-headless 4.10.0.84、SciPy 1.17.1、numba 0.62.1、tifffile 2026.3.3。Darwin arm64 选中 torch 2.7.1、torchvision 0.22.1、numpy 2.2.6。Linux x86_64 与 Windows 选中 torch 2.7.1+cpu、torchvision 0.22.1+cpu。Linux aarch64 选中 torch 2.7.1+cpu、torchvision 0.22.1。
- 按 macOS x86_64、CPython 3.12、只接受轮子解析依赖。已选中 `torch-2.2.2-cp312-none-macosx_10_9_x86_64`、`torchvision-0.17.2-cp312-cp312-macosx_10_13_x86_64`、`numpy-1.26.4-cp312-cp312-macosx_10_9_x86_64`、`opencv_python_headless-4.10.0.84-cp37-abi3-macosx_12_0_x86_64`、`scipy-1.17.1-cp312-cp312-macosx_14_0_x86_64`、`numba-0.62.1-cp312-cp312-macosx_10_15_x86_64`、`llvmlite-0.45.1-cp312-cp312-macosx_10_15_x86_64`、`scikit_image-0.26.0-cp312-cp312-macosx_10_13_x86_64`。tifffile 2026.4.11 到 2026.10.15 要求 numpy 2，2026.3.3 接受 numpy 1.26.4。完整下载在 150MB 的 torch 轮子处读超时，没有打印最终的 Would install。
- `bash -n scripts/build-engine.sh` 通过。
- 未在 macOS 上执行 `npm run package:mac`，也未冻结引擎。
