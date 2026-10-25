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

启动 Python 引擎。依赖装在仓库根目录的 `.venv`（Python 3.12，见 [develop.md](../develop.md)），其中包含 CPU 版 torch。在仓库根目录运行时，引擎读取 `model-pack`：

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

先把下载的模型包放到仓库根目录的 `model-pack`，或设置 `TUCOOLS_MODEL_PACK` 指向解压目录。宿主机有 NVIDIA 显卡时：

```powershell
docker compose -f deploy/docker-compose.yml -f deploy/docker-compose.gpu.yml up --build
```

没有 NVIDIA GPU 时不要加第二个文件，否则引擎容器无法创建：

```powershell
docker compose -f deploy/docker-compose.yml up --build
```

浏览器打开 http://127.0.0.1:8080 。

引擎只在 Compose 网络里，不映射到宿主机。页面容器把 `/api/engine` 反代过去。不要把引擎端口单独暴露到公网；这套服务没有登录。

镜像里的 torch 会使引擎镜像达到数 GB。`linux/amd64` 引擎镜像安装 CUDA 12.8 的 torch 和 `onnxruntime-gpu`，体积更大。模型包只用只读卷挂载，构建上下文也会忽略 `model-pack`。

`services/engine/requirements.txt` 给本机和 `linux/arm64` 使用。`linux/amd64` 镜像使用 `services/engine/requirements-gpu.txt`。arm64 的 torchvision CPU 轮子没有 `+cpu` 后缀，两条都写成 `0.22.1+cpu` 时，arm64 镜像会在安装依赖时失败。

宿主机有 NVIDIA 显卡时，再叠一层 `deploy/docker-compose.gpu.yml`，引擎容器才能看到显卡。驱动支持的 CUDA 版本需要达到 12.8，可以用 `nvidia-smi` 顶部的 CUDA Version 确认，并且要安装 NVIDIA Container Toolkit。消除走 PyTorch CUDA，抠图走 ONNX Runtime 的 CUDA 执行提供程序，优化走 `upscayl-bin` 的 Vulkan。没有显卡时，这三个功能仍使用 CPU。

Linux 容器里的优化需要模型包中的 `bin/linux/upscayl-bin`。只有 Windows 程序时，抠图和消除仍可使用。

## 安装包

发布用的安装包在 GitHub Actions 上构建，见下面的「分开发布」。当前系统也可以在本机打自己的包。Windows：

```powershell
npm run package:win
```

macOS：

```bash
npm run package:mac
```

Linux：

```bash
npm run package:linux
```

产物在 `apps/desktop/release`。里面是页面和壳，不含模型包，也不含 `tucools-engine.exe`。本地图像工具可以离线使用。AI 功能需要本机另有引擎：Windows 沿用随包的 `tucools-engine.exe` 或 `TUCOOLS_RUNTIME`；macOS 和 Linux 调用 `python3`（也可用 `TUCOOLS_PYTHON`）运行随包的引擎源码，依赖要装在那个 Python 里。

安装后的模型包目录：

| 系统 | 默认目录 |
| --- | --- |
| Windows | `%APPDATA%\tucools\model-pack` |
| macOS | `~/Library/Application Support/tucools/model-pack` |
| Linux | `$XDG_DATA_HOME/tucools/model-pack`，未设置时是 `~/.local/share/tucools/model-pack` |

也可以在启动前设置 `TUCOOLS_MODEL_PACK`。

正式发布的文件名：

| 平台 | 文件 |
| --- | --- |
| Windows x64 | `图酷-<版本>-windows-x64.exe` |
| macOS Apple 芯片 | `图酷-<版本>-mac-arm64.dmg`，另有同名 zip |
| macOS Intel | `图酷-<版本>-mac-x64.dmg`，另有同名 zip |
| Linux x64 | `图酷-<版本>-linux-x64.AppImage` 和 `图酷-<版本>-linux-x64.deb` |

这些包都没有代码签名。Windows 可能提示未知发布者。macOS 若拦截，到「系统设置 → 隐私与安全性」允许，或对应用执行 `xattr -dr com.apple.quarantine`。Linux 的 AppImage 先加上可执行权限；有的系统还要 `libfuse2`。deb 用 `dpkg -i` 安装，缺依赖时再执行 `apt-get install -f`。

`apps/desktop` 里的 Electron 必须写成不带 `^` 或 `~` 的固定版本，并在 `build.electronVersion` 里写同一个版本。npm workspaces 会把 `electron` 安装到仓库根目录的 `node_modules`，electron-builder 只在 `apps/desktop/node_modules` 里查找。找不到模块、版本又是范围时，安装包构建会直接失败。升级 Electron 时两处一起改。

`build.npmRebuild` 必须保持 `false`。桌面壳没有原生模块，生产依赖只有 `busboy`。工作区不会在 `apps/desktop` 下建立 `node_modules`。electron-builder 发现这个目录不存在时，会在该目录执行 `npm install --production`，并删掉仓库根目录中的开发依赖，其中包括 `app-builder-bin`。下一步再启动 `app-builder.exe` 就会失败。关闭重建后，已经提升到仓库根目录的 `busboy` 仍会打进安装包。

安装包里的「保存到…」会调用系统保存对话框。浏览器部署仍是直接下载。

安装包顶栏有「功能菜单」。勾选保存在这台电脑的当前用户数据里。启动前设置的 `TUCOOLS_FEATURES` 是允许显示的上限，配置页不能打开上限以外的工具。

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

## 广告

公开站点可以接入 Google AdSense。不设置时页面不加载广告脚本，`/ads.txt` 返回 404，工具页右侧只显示常见问题。编号写在页面容器的环境变量里，容器启动时生效，不必为此重新构建镜像。安装包默认不设置这两个变量。

```powershell
$env:TUCOOLS_ADSENSE_CLIENT = "ca-pub-0000000000000000"
$env:TUCOOLS_ADSENSE_SLOT = "0000000000"
```

`TUCOOLS_ADSENSE_CLIENT` 是发布商编号，写成 `ca-pub-` 加 10 到 20 位数字，也可以只写 `pub-` 或数字。设置后页面会：

- 在站点根提供 `ads.txt`，内容是 `google.com, pub-编号, DIRECT, f08c47fec0942fa0`。
- 加载 `adsbygoogle.js`，并写入 `google-adsense-account`。这与 easyimage 的自动广告相同，具体位置由 AdSense 后台决定。

`TUCOOLS_ADSENSE_SLOT` 是可选的展示广告单元编号，6 到 20 位数字。两个变量都有效时，工具页右侧上方显示这个单元，下面是常见问题。只设置发布商编号时，右侧不留空广告区。非法值会被忽略，并写到容器日志。开发页面读取启动 `npm run dev:web` 时的环境。

改完环境变量后重新创建页面容器。同一份镜像可以给不同站点使用各自的编号。

## 统计

公开站点可以接入 Google Analytics 4。测量 ID 写在页面容器的环境变量里，容器启动时生效，不必为此重新构建镜像。不设置或格式不对时，页面不加载 `gtag.js`。安装包默认不设置这个变量。

```powershell
$env:TUCOOLS_ANALYTICS_ID = "G-XXXXXXXXXX"
```

`TUCOOLS_ANALYTICS_ID` 是 GA4 测量 ID，写成 `G-` 加 6 到 20 位字母或数字，大小写都可以。设置后页面会：

- 先写入 `dataLayer` 和 `gtag('config', ID)`，再加载 `https://www.googletagmanager.com/gtag/js?id=ID`。这与 easyimage 的 gtag.js 相同。
- 这次 `config` 不自动发送浏览。图酷在浏览器里切换工具，不整页刷新；等路由完成后再发送 `page_view`，地址、标题和查询参数用切换后的页面。语言跳转也只记最终地址。

非法值会被忽略，并写到容器日志。开发页面读取启动 `npm run dev:web` 时的环境。测量 ID 不写入仓库或镜像。改完后重新创建页面容器。

## 独立地址和收录

每个工具都有自己的地址，例如 `/compress`、`/cutout`、`/prompt`。构建页面时会为这些地址各写一份 HTML，并生成：

- `robots.txt`：允许搜索引擎和生成式引擎抓取。
- `sitemap.xml`：列出首页和全部工具页的每种语言。功能菜单不进入站点地图。
- `llms.txt`：给生成式引擎看的工具目录。每种语言各有一份，例如 `/llms.txt` 和 `/en/llms.txt`。
- `llms-full.txt`：每个工具的说明和常见问题，同样按语言分开。

不执行 JavaScript 的抓取程序直接读到该地址的标题、说明、canonical、hreflang 和常见问题。浏览器打开后仍是原来的工具页面。宽屏时常见问题在右侧，窄屏时排在功能区下面。

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

`/zh` 和 `/zh/compress` 会转到不带前缀的简体中文地址。网页不按浏览器语言跳转。顶栏选择的语言记在 `tucools-locale`，只在下次打开站点根 `/` 时使用。安装包第一次打开根地址、且没有保存语言时，按系统语言打开。产品名在每种语言里都是「图酷」。

安装包和 Docker 可以部署在不同域名，所以未设置站点根时，规范地址写成站内路径，例如 `/en/compress`。页面在浏览器里会改成当前域名的绝对地址。公开站点要让 sitemap、hreflang 和 `llms.txt` 使用绝对地址时，设置不带路径的站点根：

```powershell
$env:TUCOOLS_SITE_URL = "https://图片站点.example"
```

地址必须是 `http://` 或 `https://` 开头，不能带路径。不符合时容器会忽略它。这个变量在本地 `docker compose up --build` 时会进入页面构建；容器启动时，入口脚本还会把仍然是站内路径的规范地址、hreflang 和收录链接改成绝对地址。已经是绝对地址的链接不会再加一遍前缀。发布镜像和安装包时，仓库变量 `TUCOOLS_SITE_URL` 会作为构建参数 `VITE_SITE_URL`。

`TUCOOLS_FEATURES` 只影响浏览器里显示哪些工具。静态说明和站点地图仍包含全部工具。只打算公开一部分工具时，不要把收起的地址暴露到公网。

## 分开发布

推送版本标签不会构建镜像，也不会打安装包。页面镜像、引擎镜像、Windows、macOS、Linux 可以同时跑：两个镜像各是一个工作流，三个安装包在「发布安装包」里各是一个任务。一个失败不会取消其余的。

工作流文件要先在默认分支上，Actions 页面才会出现按钮。运行时再选择含有这些文件的标签。旧标签上没有这些工作流，不能用来发布。

### 1. 推送标签

标签必须是 `v主版本.次版本.修订号`，例如 `v0.3.0`。`v1.2`、`v1.2.3-beta`、`v01.2.3` 会被拒绝。工作流不会创建标签，也不会把已有标签移到别的提交。

```powershell
git tag v0.3.0
git push origin v0.3.0
```

这一步只标记提交。仓库里不会出现新的构建。

### 2. 按需要运行

打开 GitHub 仓库的 Actions。下面三个工作流可以连续点开。它们使用不同的并发组，会同时执行。

| 工作流 | 跑什么 | 什么时候跑 |
| --- | --- | --- |
| 发布页面镜像 | `ghcr.io/<所有者>/tucools-web:<版本>`，`linux/amd64` 和 `linux/arm64` | 页面、nginx 或站点构建参数变了 |
| 发布引擎镜像 | `ghcr.io/<所有者>/tucools-engine:<版本>`。amd64 含 CUDA 12.8，arm64 是 CPU。这一步最慢 | 引擎、依赖或引擎镜像变了 |
| 发布安装包 | Windows x64、macOS arm64/x64、Linux x64 三个任务同时开始 | 需要新的安装包 |

每个工作流的「Use workflow from」选择标签 `v0.3.0`，版本号留空。这样构建的就是标签指向的那一次提交。

从分支运行时必须填写版本号，例如 `0.3.0` 或 `v0.3.0`。远程标签 `v0.3.0` 必须已经指向这次提交，否则工作流失败。不要选一个和标签不一致的分支再填这个版本。

镜像工作流还有「是否把这次镜像标为 latest」：

| 选项 | 行为 |
| --- | --- |
| `auto` | 默认。没有更高的 `vX.Y.Z` 标签时，才把 `latest` 指到这次版本 |
| `yes` | 总是移动 `latest` |
| `no` | 不移动 `latest` |

安装包工作流默认勾选三个平台。只重做其中一个时，取消另外两个。三个任务之间没有依赖。macOS 失败时，Windows 和 Linux 仍会上传自己的附件。要重跑失败的平台，可以在那次运行里选择 Re-run failed jobs，或重新运行工作流并只勾选该平台。

同一件产物的第二次运行会排队，不会取消正在进行的那一次。页面镜像、引擎镜像和安装包互不排队。

### 3. 发布页上有什么

任一工作流成功后，都会给这个已有标签创建 GitHub Release。说明只在第一次创建时写入，之后的任务只追加自己的附件，不覆盖说明。

安装包附件使用上面的文件名。每个平台另有 `SHA256SUMS-windows.txt`、`SHA256SUMS-macos.txt` 或 `SHA256SUMS-linux.txt`，所以三个任务同时上传也不会改写对方的校验文件。

镜像不放进 Release 的二进制附件。坐标写在说明里。摘要写在 `tucools-web-<版本>.txt` 或 `tucools-engine-<版本>.txt`，也写在对应 Actions 运行的摘要里。

版本号只写进当次运行的 `package.json`，不会提交回分支。镜像使用工作流自带的 `GITHUB_TOKEN`，不需要 Docker Hub 账号。两个镜像都包含 `linux/amd64` 和 `linux/arm64`。安装包和镜像都不含模型包。本机 `npm run engine` 仍安装 CPU 依赖。

GitHub 包页面上的描述来自多架构清单索引的 `org.opencontainers.image.description`。各架构镜像里的 `LABEL` 不会显示在这个页面上。发布镜像时会把描述写到索引注解；页面镜像是「图酷页面」，引擎镜像是「图酷图像处理引擎」。推送后工作流会读取清单，没有描述就失败。已经推送的旧清单不会自动补上描述，需要重新运行对应的镜像工作流。

容器包第一次出现时默认是私有的。仓库给其他人使用时，到 GitHub 的 Packages 页面把 `tucools-web` 和 `tucools-engine` 改为公开。之后再次发布会更新已有的包。

以前的 Windows 附件名是 `图酷-Setup-<版本>.exe`。从这套工作流开始，Windows 文件名是 `图酷-<版本>-windows-x64.exe`。已经发出的旧 Release 不会改名。

只部署、不在本机构建时，使用 `deploy/docker-compose.deploy.yml`。它没有 `build`，默认拉取 `ghcr.io/dingdangdog/tucools-web` 和 `ghcr.io/dingdangdog/tucools-engine` 的 `latest`。引擎只留在 Compose 网络内，页面仍监听 `8080`。模型包目录、功能菜单、站点根和广告变量与上面的构建用 Compose 相同。

```powershell
docker login ghcr.io
docker compose -f deploy/docker-compose.deploy.yml -f deploy/docker-compose.gpu.yml up -d
```

没有 NVIDIA GPU 时去掉 `-f deploy/docker-compose.gpu.yml`。

固定版本时设置 `TUCOOLS_VERSION`，不要带 `v` 前缀：

```powershell
$env:TUCOOLS_VERSION = "0.2.0"
docker compose -f deploy/docker-compose.deploy.yml -f deploy/docker-compose.gpu.yml up -d
```

要换仓库或标签时，再分别设置完整镜像名。设置后 `TUCOOLS_VERSION` 不再参与这两个镜像名：

```powershell
$env:TUCOOLS_WEB_IMAGE = "ghcr.io/<所有者>/tucools-web:0.2.0"
$env:TUCOOLS_ENGINE_IMAGE = "ghcr.io/<所有者>/tucools-engine:0.2.0"
docker compose -f deploy/docker-compose.deploy.yml -f deploy/docker-compose.gpu.yml up -d
```

私有包拉取前需要 `docker login ghcr.io`；公开包可以直接拉取。重发旧版本时，镜像工作流的 `auto` 不会把 `latest` 改到更旧的版本；只有选择 `yes` 才会。本机没有对应镜像时，这条 Compose 只会拉取，不会回退到本地构建。

`deploy/docker-compose.yml` 仍用于从源码构建。使用其中已填写的发布镜像、且不要构建时，可以不带 `--build`：

```powershell
$env:TUCOOLS_WEB_IMAGE = "ghcr.io/<所有者>/tucools-web:0.2.0"
$env:TUCOOLS_ENGINE_IMAGE = "ghcr.io/<所有者>/tucools-engine:0.2.0"
docker login ghcr.io
docker compose -f deploy/docker-compose.yml -f deploy/docker-compose.gpu.yml pull
docker compose -f deploy/docker-compose.yml -f deploy/docker-compose.gpu.yml up -d
```

没有设置这两个变量时，`deploy/docker-compose.yml` 仍在本地构建 `tucools-web:0.1.0` 和 `tucools-engine:0.1.0`。
