# 图酷

图酷用来处理图片，英文名是 TuCools。安装包在本机打开一个窗口，Docker 用浏览器打开。两套用的是同一份页面。

压缩、裁剪、加水印这些在这台设备上完成，图片不会上传。抠图、优化和消除交给图酷自己的引擎，需要另外下载模型包。没有登录。

- 仓库：[github.com/dingdangdog/tucools](https://github.com/dingdangdog/tucools)
- 安装包和镜像：[Releases](https://github.com/dingdangdog/tucools/releases)
- 模型包：[models](https://github.com/dingdangdog/tucools/releases/tag/models)

## 示例

| 想做的事 | 打开 |
| --- | --- |
| 把一张 JPEG 压到大约 200KB | 压缩 |
| 把宽边放到 1920，多出来的地方留白 | 缩放 |
| PNG 转成 WebP | 转格式 |
| 框选一块，边拖边看结果，再导出 PNG | 裁剪 |
| 做成一寸比例，并铺上蓝底或红底 | 证件照尺寸。这里只裁切和铺底色，不抠图 |
| 放进常见的社交平台尺寸 | 社交尺寸 |
| 做成应用商店的图标、截图和宣传图 | 应用商店尺寸 |
| 切成宫格，或再拼回去 | 切图 |
| 盖上半透明文字，或在画面中间加一行大字 | 水印、加字 |
| 转成灰度，或按直径裁成圆图 | 灰度、圆形 |
| 多张图片各成一页，导出 PDF | 图转 PDF |
| 导出 16、32、48、180 的 PNG 和一个 ICO | Favicon |
| 去掉拍摄位置等 EXIF，得到一张新图 | 去除信息 |
| 查看照片信息，并导出 JSON | 图片信息 |
| 读出 PNG、JPEG 里已经写好的 AI 提示词 | AI提示词提取。只读取文件里的文字，不重新生成 |
| 去掉背景，导出透明 PNG | 抠图 |
| 放大并让画面更清楚 | 优化 |
| 把路人、水印或杂物涂掉 | 消除 |

证件照尺寸、社交尺寸、应用商店尺寸和圆形都在「裁剪」里切换。切图是拆成多块，单独一项。

## 功能

**常规处理**不需要模型，图片留在本机。

- 压缩：按质量、最长边或目标体积压缩 JPEG、PNG、WebP。
- 缩放：按指定宽高缩放，也可以留白放入画布。
- 转格式：在 PNG、JPEG、WebP、BMP、ICO 之间转换。
- 裁剪：框选时实时预览，点击可看大图，再导出 PNG。
- 证件照尺寸、社交尺寸、应用商店尺寸、圆形。
- 切图：按竖线、横线、斜线或宫格切开，也可以再拼回去。
- 水印、加字、灰度。
- 图转 PDF、Favicon。

**信息处理**也不需要模型。

- 去除信息：查看 EXIF，再重绘成不含元数据的新图。
- 图片信息：查看 EXIF，并可导出 JSON。
- AI提示词提取：读取嵌入的提示词、负向提示词和生成参数。

**AI 处理**需要下面的模型包。单张上传上限 50MB，引擎同时只处理一张。

- 抠图：可选通用、轻量、人像、高精度、动漫，导出透明 PNG。
- 优化：可选通用增强、标准增强、高质量增强、数字艺术、动漫，并选择放大倍数。
- 消除：涂抹要去掉的区域，再由引擎补上。

## 安装客户端

打开仓库的 [Releases](https://github.com/dingdangdog/tucools/releases)，下载对应系统的安装包：

| 系统 | 文件 |
| --- | --- |
| Windows x64 | `TuCools-<版本>-windows-x64.exe` |
| macOS Apple 芯片 | `TuCools-<版本>-mac-arm64.dmg`，另有同名 zip |
| macOS Intel | `TuCools-<版本>-mac-x64.dmg`，另有同名 zip |
| Linux x64 | `TuCools-<版本>-linux-x86_64.AppImage` 和 `TuCools-<版本>-linux-amd64.deb` |

某一版如果只有说明、没有这些文件，是这一版的安装包还没附上。换一个已经带有安装包的版本，或先用下面的 Docker。

安装包没有代码签名。Windows 可能提示未知发布者，选择仍要运行即可。macOS 若拦截，到「系统设置 → 隐私与安全性」允许打开。Linux 的 AppImage 先加上可执行权限；deb 用 `dpkg -i` 安装。

装好后直接打开。常规处理和信息处理马上能用。抠图、优化和消除还要把模型包放到下面的目录。

## 用 Docker 打开

先安装 Docker。在空目录执行：

```powershell
git clone https://github.com/dingdangdog/tucools.git
cd tucools
docker compose -f deploy/docker-compose.deploy.yml up -d
```

浏览器打开 http://127.0.0.1:8080 。

有 NVIDIA 显卡，并且已经安装 NVIDIA Container Toolkit 时，再加上显卡配置。驱动支持的 CUDA 版本需要达到 12.8。没有显卡时不要加这个文件，否则容器无法创建：

```powershell
docker compose -f deploy/docker-compose.deploy.yml -f deploy/docker-compose.gpu.yml up -d
```

镜像里没有模型。把下一节解压好的目录放成仓库里的 `model-pack`，使 `tucools/model-pack/models` 和 `tucools/model-pack/bin` 存在，然后重新执行上面的启动命令。页面上点「重新检查」。

没有显卡时，抠图、优化和消除使用 CPU。Linux 容器里的优化还需要模型包中的 `bin/linux/upscayl-bin`。

更多部署选项见 [docs/deploy.md](docs/deploy.md)。

## 下载模型

只有抠图、优化和消除需要模型。压缩、裁剪、加水印不用下载。

下载 [model-pack.zip](https://github.com/dingdangdog/tucools/releases/download/models/model-pack.zip)（约 900MB）。发布页是 [models](https://github.com/dingdangdog/tucools/releases/tag/models)。

解压后应能直接看到两个文件夹：

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

也可以在启动图酷前把解压目录指到别处，例如：

```powershell
$env:TUCOOLS_MODEL_PACK = "D:\downloads\model-pack"
```

**Docker** 使用仓库里的 `model-pack`，或在启动前用 `TUCOOLS_MODEL_PACK` 指向解压目录。该目录里同样要直接有 `models` 和 `bin`。

放好后重新打开抠图、优化或消除，点「重新检查」。

- 抠图：五个模型里有一个就能用对应效果，例如 `models/u2net.onnx`。
- 消除：需要 `models/big-lama.pt`。
- 优化：需要所选效果的 `.bin` 和 `.param`，以及本系统的程序。Windows 是 `bin/windows/upscayl-bin.exe`，macOS 是 `bin/macos/upscayl-bin`，Linux 是 `bin/linux/upscayl-bin`。

macOS 或 Linux 上优化不能开始时，给程序加上可执行权限后再检查：

```bash
chmod +x "bin/macos/upscayl-bin"
chmod +x "bin/linux/upscayl-bin"
```

只缺一部分文件时，已经齐的效果仍可使用，页面会列出还缺的文件。完整文件名见 [docs/models.md](docs/models.md)。

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

网页不会按浏览器语言自动跳转。阿拉伯语页面从右向左排。

## 开发

改页面或引擎见 [develop.md](develop.md)。
