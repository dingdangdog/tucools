## 安装包

这一版的安装包、页面镜像和引擎镜像分开构建。某个附件还没有出现时，对应的发布任务还没完成。

安装包没有代码签名，不含模型包，也不含 tucools-engine.exe。本地图像工具可以离线使用。

| 平台 | 文件 |
| --- | --- |
| Windows x64 | 图酷-__VERSION__-windows-x64.exe |
| macOS Apple 芯片 | 图酷-__VERSION__-mac-arm64.dmg |
| macOS Intel | 图酷-__VERSION__-mac-x64.dmg |
| Linux x64 | 图酷-__VERSION__-linux-x64.AppImage 和 图酷-__VERSION__-linux-x64.deb |

macOS 若提示无法打开，到「系统设置 → 隐私与安全性」里允许，或对应用执行 xattr -dr com.apple.quarantine。Linux 的 AppImage 需要可执行权限；deb 用 dpkg -i 安装。

校验文件是 SHA256SUMS-windows.txt、SHA256SUMS-macos.txt、SHA256SUMS-linux.txt。同名 blockmap 可以忽略。

模型包目录：Windows 为 %APPDATA%\tucools\model-pack，macOS 为 ~/Library/Application Support/tucools/model-pack，Linux 为 ~/.local/share/tucools/model-pack。也可以设置 TUCOOLS_MODEL_PACK。

## Docker 镜像

镜像不含模型包。linux/amd64 引擎镜像安装 CUDA 12.8 的 PyTorch，linux/arm64 引擎镜像是 CPU 版。

- 页面：__WEB_IMAGE__:__VERSION__
- 引擎：__ENGINE_IMAGE__:__VERSION__

摘要文件是 tucools-web-__VERSION__.txt 和 tucools-engine-__VERSION__.txt。latest 是否移动取决于发布镜像时的选项；重发旧版本默认不覆盖更新的 latest。

容器包第一次发布时默认私有。需要给其他人拉取时，到 GitHub Packages 把这两个包改为公开。

固定版本部署时设置 TUCOOLS_VERSION=__VERSION__，再执行：

    docker compose -f deploy/docker-compose.deploy.yml -f deploy/docker-compose.gpu.yml up -d

没有 NVIDIA GPU 时去掉 -f deploy/docker-compose.gpu.yml。说明见 docs/deploy.md。
