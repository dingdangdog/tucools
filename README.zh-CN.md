<p align="center">
  <a href="./README.md">English</a>
  &nbsp;·&nbsp;
  <a href="./README.zh-CN.md"><strong>中文</strong></a>
</p>

<div align="center">
  <h1>图酷</h1>
  <p>在自己的电脑上处理图片。安装包和 Docker 打开的是同一份页面。英文名是 TuCools。</p>
</div>

<p align="center">
  <img alt="client release" src="https://img.shields.io/github/v/release/dingdangdog/tucools?filter=client-v%2A&display_name=tag&sort=semver&label=client" />
  <img alt="web release" src="https://img.shields.io/github/v/release/dingdangdog/tucools?filter=web-v%2A&display_name=tag&sort=semver&label=web" />
  <img alt="engine release" src="https://img.shields.io/github/v/release/dingdangdog/tucools?filter=engine-v%2A&display_name=tag&sort=semver&label=engine" />
  <img alt="stars" src="https://img.shields.io/github/stars/dingdangdog/tucools" />
  <img alt="forks" src="https://img.shields.io/github/forks/dingdangdog/tucools" />
</p>
<p align="center">
  <img alt="issues-open" src="https://img.shields.io/github/issues/dingdangdog/tucools?color=important" />
  <img alt="issues-closed" src="https://img.shields.io/github/issues-closed/dingdangdog/tucools?color=green" />
  <a href="https://github.com/dingdangdog/tucools/pkgs/container/tucools-web"><img alt="tucools-web" src="https://img.shields.io/badge/ghcr.io-tucools--web-2496ED" /></a>
  <a href="https://github.com/dingdangdog/tucools/pkgs/container/tucools-engine"><img alt="tucools-engine" src="https://img.shields.io/badge/ghcr.io-tucools--engine-2496ED" /></a>
</p>

压缩、裁剪、转格式、加水印这些在页面里完成，图片留在这台设备上。抠图、优化和消除交给图酷自己的引擎，需要另外下载[模型包](https://github.com/dingdangdog/tucools/releases/tag/models)。打开就能用，没有登录。

安装包在标题以 TuCools Client 开头的 [Releases](https://github.com/dingdangdog/tucools/releases)。不想看源码、只想用上抠图、优化和消除，从[怎么用上 AI 功能](docs/2026-10-26-如何使用AI功能.md)开始。

## 示例

| 想做的事 | 打开 |
| --- | --- |
| 把一张 JPEG 压到大约 200KB | 压缩 |
| 把长边放到 1920，多出来的地方留白 | 缩放 |
| 边拖边看，再导出 PNG | 裁剪 |
| 做成证件照比例，并铺上蓝底或红底 | 证件照尺寸，在「裁剪」里。这里只裁切和铺底色 |
| 每张图片一页，先看预览再导出 PDF | 图转 PDF |
| 去掉背景 | 抠图。需要模型包 |
| 把路人、水印或杂物涂掉 | 消除。需要模型包 |

证件照尺寸、社交尺寸、应用商店尺寸和圆形都在「裁剪」里切换。切图是拆成多块，单独一项。

## 功能

**常规处理。** 不用模型包，图片留在这台设备上。

- **压缩。** 按质量、最长边或目标体积压缩 JPEG、PNG、WebP。
- **缩放。** 按指定宽高缩放，或留白放入画布。
- **转格式。** 在 PNG、JPEG、WebP、BMP、ICO 之间转换。
- **裁剪。** 框选时实时预览，点击可看大图，再导出 PNG。证件照尺寸、社交尺寸、应用商店尺寸和圆形都在这里。证件照尺寸会铺上底色。
- **切图。** 按竖线、横线、斜线或宫格切开，也可以再拼回去。
- **水印**和**加字。** 半透明文字，或在画面中间加一行大字。
- **灰度。**
- **图转 PDF。** 每张图片一页。预览会跟着纸张、方向和顺序变化。
- **Favicon。** 导出 16、32、48、180 的 PNG 和一个 ICO。

**信息处理。** 也不用模型包。

- **去除信息。** 查看 EXIF，再保存成一张不含这些元数据的新图。
- **图片信息。** 查看 EXIF，并可导出 JSON。
- **AI提示词提取。** 读取 PNG、JPEG 里已经写好的提示词、负向提示词和生成参数。

**AI 处理。** 这三项走本机引擎，需要下面的模型包。一次一张，上传上限 50MB。

- **抠图。** 可选通用、轻量、人像、高精度、动漫，导出透明 PNG。
- **优化。** 可选通用增强、标准增强、高质量增强、数字艺术、动漫，并选择放大倍数。
- **消除。** 涂抹要去掉的区域，再由引擎补上。

## 安装客户端

在标题以 TuCools Client 开头的 [发布](https://github.com/dingdangdog/tucools/releases) 里下载对应系统的安装包：

| 系统 | 文件 |
| --- | --- |
| Windows x64 | `TuCools-<版本>-windows-x64.exe` |
| macOS Apple 芯片 | `TuCools-<版本>-mac-arm64.dmg`，另有同名 zip |
| macOS Intel | `TuCools-<版本>-mac-x64.dmg`，另有同名 zip |
| Linux x64 | `TuCools-<版本>-linux-x86_64.AppImage` 和 `TuCools-<版本>-linux-amd64.deb` |

客户端发布里会列出已经完成的安装包。某个系统的文件要等对应任务成功后才会出现。页面镜像和引擎镜像是另外的发布，里面没有这些安装包。

安装包没有代码签名。Windows 出现未知发布者时，选择仍要运行。macOS 到「系统设置 → 隐私与安全性」允许打开。Linux 的 AppImage 先加上可执行权限；deb 用 `dpkg -i` 安装。

装好后，常规处理和信息处理马上能用。抠图、优化和消除还要把模型包放到下面的目录。在这几个页面点「下载并安装」，程序会下载并解压到该目录。网页和 Docker 仍从发布页下载。

## 用 Docker 打开

已发布的这套服务监听 **13175**。镜像标签、显卡配置和站点选项见 [docs/deploy.md](docs/deploy.md)。

1. **安装 Docker。** 装好带 Compose 的 [Docker Engine](https://docs.docker.com/engine/install/) 即可。
2. **启动。**

   ```bash
   git clone https://github.com/dingdangdog/tucools.git
   cd tucools
   docker compose -f deploy/docker-compose.deploy.yml up -d
   ```

   浏览器打开 http://127.0.0.1:13175 。

3. **NVIDIA，可选。** 本机有 NVIDIA 显卡，并且已经安装 [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html) 时，再加上下面的显卡配置。驱动支持的 CUDA 版本需要达到 12.8。没有显卡时不要加这个文件，否则引擎容器无法创建。

   ```bash
   docker compose -f deploy/docker-compose.deploy.yml -f deploy/docker-compose.gpu.yml up -d
   ```

4. **模型。** 镜像里没有模型。解压后要能看到 `tucools/model-pack/models` 和 `tucools/model-pack/bin`，再执行一次上面的启动命令，然后在页面上点「重新检查」。

没有显卡时，抠图、优化和消除使用 CPU。Linux 容器里的优化还需要模型包中的 `bin/linux/upscayl-bin`。

镜像：[`ghcr.io/dingdangdog/tucools-web`](https://github.com/dingdangdog/tucools/pkgs/container/tucools-web) 和 [`ghcr.io/dingdangdog/tucools-engine`](https://github.com/dingdangdog/tucools/pkgs/container/tucools-engine)。

## 下载模型

只有抠图、优化和消除需要模型。

从 [models](https://github.com/dingdangdog/tucools/releases/tag/models) 发布页下载 [model-pack.zip](https://github.com/dingdangdog/tucools/releases/download/models/model-pack.zip)（约 900MB）。解压后应能直接看到两个文件夹：

- `models`：抠图、消除和优化用的模型
- `bin`：优化程序，Windows、Linux、macOS 各一份

如果看到的是 `model-pack/model-pack/models`，说明多套了一层。去掉里面那一层，直到 `models` 和 `bin` 挨在一起。

**安装包**把这一层放进：

| 系统 | 目录 |
| --- | --- |
| Windows | `%APPDATA%\tucools\model-pack` |
| macOS | `~/Library/Application Support/tucools/model-pack` |
| Linux | `~/.local/share/tucools/model-pack`。如果设置了 `XDG_DATA_HOME`，则放在它下面的 `tucools/model-pack` |

Windows 按 Win+R，输入 `%APPDATA%\tucools`，回车。没有 `model-pack` 就新建。放好后，这个目录里应直接有 `models` 和 `bin`。

也可以在启动图酷前把解压目录指到别处：

```powershell
$env:TUCOOLS_MODEL_PACK = "D:\downloads\model-pack"
```

```bash
export TUCOOLS_MODEL_PACK="$HOME/downloads/model-pack"
```

**Docker** 使用仓库里的 `model-pack`，或在启动前用 `TUCOOLS_MODEL_PACK` 指向解压目录。该目录里同样要直接有 `models` 和 `bin`。

放好后重新打开抠图、优化或消除，点「重新检查」。

- 抠图：某个效果的文件在，就能用这个效果。例如 `models/u2net.onnx`。
- 消除：需要 `models/big-lama.pt`。
- 优化：需要所选效果的 `.bin` 和 `.param`，以及本系统的程序。Windows 是 `bin/windows/upscayl-bin.exe`，macOS 是 `bin/macos/upscayl-bin`，Linux 是 `bin/linux/upscayl-bin`。

macOS 或 Linux 上优化不能开始时，给程序加上可执行权限后再检查：

```bash
chmod +x "bin/macos/upscayl-bin"
chmod +x "bin/linux/upscayl-bin"
```

已经齐的效果仍可使用，页面会列出还缺的文件。完整文件名见 [docs/models.md](docs/models.md)。

## 语言

默认是简体中文，地址不带前缀。顶栏可以改语言。英语界面的产品名是 TuCools，其他语言仍是「图酷」。

| 语言 | 地址前缀 |
| --- | --- |
| 繁体中文 | `/zh_hant` |
| 英语 | `/en` |
| 西班牙语 | `/es` |
| 德语 | `/de` |
| 日语 | `/ja` |
| 巴西葡萄牙语 | `/pt_br` |
| 印地语 | `/hi` |
| 越南语 | `/vn` |
| 阿拉伯语 | `/ar` |
| 孟加拉语 | `/bn` |

网页保持地址里的语言，不会按浏览器语言自动跳转。安装包第一次打开、且没有保存语言时，按系统语言选择。阿拉伯语页面从右向左排。

## 开发

页面、引擎和打包步骤见 [develop.md](develop.md)。

```powershell
npm install
npm run dev:web
```

开发页面在 http://127.0.0.1:13175 。引擎还没启动时，常规处理已经能用。抠图、优化和消除还需要引擎和模型包。

## 文档

- [部署](docs/deploy.md)：Docker、安装包、镜像和站点选项
- [模型](docs/models.md)：文件名，以及各自用在哪里
- [怎么用上 AI 功能](docs/2026-10-26-如何使用AI功能.md)：不看源码，用上抠图、优化和消除
- [开发](develop.md)：页面、引擎和本地启动
