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

打开 http://127.0.0.1:13175 。本地工具这时就能用。

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

侧栏最上是「全部功能」，点击回到首页。下面依次是「AI 处理」「常规处理」「信息处理」。

| 功能名 | 工具 |
| --- | --- |
| `cutout` | 抠图 |
| `enhance` | 优化 |
| `erase` | 消除 |
| `compress` | 压缩 |
| `resize` | 缩放 |
| `converter` | 转格式 |
| `cropping` | 裁剪 |
| `id-photo` | 证件照尺寸 |
| `sizes` | 社交尺寸 |
| `store` | 应用商店尺寸 |
| `cutting` | 切图 |
| `watermark` | 水印 |
| `caption` | 加字 |
| `fade` | 灰度 |
| `tocircle` | 圆形 |
| `pdf` | 图转 PDF |
| `favicon` | Favicon |
| `exif` | 去除信息 |
| `pix` | 图片信息 |
| `prompt` | AI提示词提取 |

## 独立地址和收录

每个工具都有自己的地址，例如 `/compress`、`/cutout`、`/prompt`。构建页面时会为这些地址各写一份 HTML，并生成：

- `robots.txt`：允许搜索引擎和生成式引擎抓取。
- `sitemap.xml`：列出首页和全部工具页的每种语言。功能菜单不进入站点地图。
- `llms.txt`：给生成式引擎看的工具目录。每种语言各有一份，例如 `/llms.txt` 和 `/en/llms.txt`。
- `llms-full.txt`：每个工具的说明和常见问题，同样按语言分开。

不执行 JavaScript 的抓取程序直接读到该地址的标题、说明、canonical、hreflang 和常见问题。浏览器打开后仍是原来的工具页面，常见问题收在页面下方。

简体中文是默认语言，地址不带前缀，例如 `/compress`。其余语言沿用原站的前缀：

| 前缀 | 语言 |
| --- | --- |
| （无） | 简体中文 |
| `en` | English |
| `zh_hant` | 繁体中文 |
| `es` | Español |
| `de` | Deutsch |
| `ja` | 日本語 |
| `pt_br` | Português (Brasil) |
| `hi` | हिन्दी |
| `vn` | Tiếng Việt |
| `ar` | العربية，从右到左 |
| `bn` | বাংলা |

`/zh` 和 `/zh/compress` 会转到不带前缀的简体中文地址。网页不按浏览器语言跳转。顶栏选择的语言记在 `tucools-locale`，只在下次打开站点根 `/` 时使用。Windows 安装包第一次打开根地址、且没有保存语言时，按系统语言打开。产品名在每种语言里都是「图酷」。

安装包和 Docker 可以部署在不同域名，所以未设置站点根时，规范地址写成站内路径，例如 `/en/compress`。页面在浏览器里会改成当前域名的绝对地址。公开站点要让 sitemap、hreflang 和 `llms.txt` 使用绝对地址时，设置不带路径的站点根：

```powershell
$env:TUCOOLS_SITE_URL = "https://图片站点.example"
```

地址必须是 `http://` 或 `https://` 开头，不能带路径。不符合时容器会忽略它。这个变量在本地 `docker compose up --build` 时会进入页面构建；容器启动时，入口脚本还会把仍然是站内路径的规范地址、hreflang 和收录链接改成绝对地址。已经是绝对地址的链接不会再加一遍前缀。发布镜像和安装包时，仓库变量 `TUCOOLS_SITE_URL` 会作为构建参数 `VITE_SITE_URL`。

`TUCOOLS_FEATURES` 只影响浏览器里显示哪些工具。静态说明和站点地图仍包含全部工具。只打算公开一部分工具时，不要把收起的地址暴露到公网。

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
