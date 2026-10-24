# 部署与开发

图酷有一份页面和一份引擎契约。浏览器工具在页面里完成。抠图、优化和消除请求同源 `/api/engine`。

模型包单独下载，说明见 [models.md](models.md)。安装包和 Docker 镜像都不包含 `model-pack`。

## 开发

安装依赖：

```powershell
npm install
```

启动页面：

```powershell
npm run dev:web
```

打开 http://127.0.0.1:5173 。本地工具这时就能用。

启动 Python 引擎。依赖装在仓库根目录的 `.venv`（Python 3.12，见 README），其中包含 CPU 版 torch。在仓库根目录运行时，引擎读取 `model-pack`：

```powershell
npm run engine
```

页面通过 Vite 把 `/api/engine` 转到 `127.0.0.1:8787`。

桌面壳在开发时打开同一页面，并在 8787 没有引擎时尝试启动 Python：

```powershell
npm run dev:desktop
```

如果本机没有 Python，但有旧的 `.runtime`，设置后再打开安装包或自行让引擎监听 8787：

```powershell
$env:TUCOOLS_RUNTIME = "E:\work-gt\gt-tucools\desktop\.runtime"
```

安装包会优先使用随包的 `tucools-engine.exe`，否则使用 `TUCOOLS_RUNTIME` 里的 `erembg.exe`、`eenhance.exe`、`eerase.exe`。没有这些文件时，本地工具仍可用。AI 页在引擎未响应或没有可用模型时不能开始处理。

生成引擎可执行文件的入口脚本是 `scripts/build-engine.ps1`。它不会把模型包打进安装包。

## Docker

先把下载的模型包放到仓库根目录的 `model-pack`，或设置 `TUCOOLS_MODEL_PACK` 指向解压目录。然后：

```powershell
docker compose -f deploy/docker-compose.yml up --build
```

浏览器打开 http://127.0.0.1:8080 。

引擎只在 Compose 网络里，不映射到宿主机。页面容器把 `/api/engine` 反代过去。不要把引擎端口单独暴露到公网；这套服务没有登录。

镜像里的 torch 会使引擎镜像达到数 GB。模型包只用只读卷挂载，构建上下文也会忽略 `model-pack`。

Linux 容器里的优化需要模型包中的 `bin/linux/upscayl-bin`。只有 Windows 程序时，抠图和消除仍可使用。

## Windows 安装包

```powershell
npm run package:win
```

安装包在 `apps/desktop/release`。里面是页面和壳，不含模型包。安装后把模型包解压到 `%APPDATA%\tucools\model-pack`，或在启动前设置 `TUCOOLS_MODEL_PACK`。

安装包里的「保存到…」会调用系统保存对话框。浏览器部署仍是直接下载。

安装包顶栏有「功能菜单」。勾选保存在这台 Windows 用户的本机数据里。启动前设置的 `TUCOOLS_FEATURES` 是允许显示的上限，配置页不能打开上限以外的工具。

## 功能菜单

`TUCOOLS_FEATURES` 用逗号列出要显示的功能名。不设置或留空时显示全部。未知名称会被忽略；写了内容但没有一个已知名称时，不显示工具。

```powershell
$env:TUCOOLS_FEATURES = "compress,resize,cutout,enhance"
```

开发页面读取运行 `npm run dev:web` 的环境。Docker 读取页面容器的环境，改完后需要重新创建页面容器。安装包读取启动图酷时的环境。客户端在这个上限里再做本机选择，键名是 `tucools-features`。浏览器部署没有配置页，只服从环境变量。直接打开未显示功能的地址会回到首页。

| 功能名 | 工具 |
| --- | --- |
| `compress` | 压缩 |
| `resize` | 缩放 |
| `converter` | 转格式 |
| `cropping` | 裁剪 |
| `id-photo` | 证件照尺寸 |
| `sizes` | 社交尺寸 |
| `cutting` | 切图 |
| `watermark` | 水印 |
| `caption` | 加字 |
| `fade` | 灰度 |
| `tocircle` | 圆形 |
| `exif` | 去除信息 |
| `pdf` | 图转 PDF |
| `favicon` | Favicon |
| `prompt` | 嵌入提示 |
| `pix` | 图片信息 |
| `cutout` | 抠图 |
| `enhance` | 优化 |
| `erase` | 消除 |

## 按标签发布

推送形如 `v0.2.0` 的标签后，`.github/workflows/release.yml` 会读取版本号，构建并发布。`v1.2`、`v1.2.3-beta` 这类标签会在校验步骤失败，不会发版。

```powershell
git tag v0.2.0
git push origin v0.2.0
```

版本号来自标签本身。工作流会在构建安装包前把这个版本写入当次运行的 `package.json`，不会把版本提交回分支。

发布内容：

- Windows x64 NSIS 安装包，附在 GitHub Release 上，并带有 SHA256 校验文件。安装包没有代码签名，Windows 可能提示未知发布者。
- 页面镜像 `ghcr.io/<所有者>/tucools-web:<版本>`，以及同名 `latest`。
- 引擎镜像 `ghcr.io/<所有者>/tucools-engine:<版本>`，以及同名 `latest`。

镜像推送到 GitHub Container Registry，使用工作流自带的 `GITHUB_TOKEN`，不需要 Docker Hub 账号。两个镜像都构建 `linux/amd64` 和 `linux/arm64`。镜像和安装包都不含模型包。安装包沿用 `npm run package:win`，不包含 `tucools-engine.exe`。

容器包第一次出现时默认是私有的。仓库给其他人使用时，到 GitHub 的 Packages 页面把 `tucools-web` 和 `tucools-engine` 改为公开。之后再次推送标签会更新这两个包。

使用本次发布的镜像时不要加 `--build`：

```powershell
$env:TUCOOLS_WEB_IMAGE = "ghcr.io/<所有者>/tucools-web:0.2.0"
$env:TUCOOLS_ENGINE_IMAGE = "ghcr.io/<所有者>/tucools-engine:0.2.0"
docker login ghcr.io
docker compose -f deploy/docker-compose.yml pull
docker compose -f deploy/docker-compose.yml up -d
```

没有设置这两个变量时，Compose 仍在本地构建 `tucools-web:0.1.0` 和 `tucools-engine:0.1.0`。私有包拉取前需要 `docker login ghcr.io`；公开包可以直接拉取。再推送一个更旧的标签也会把 `latest` 改到那个版本。
