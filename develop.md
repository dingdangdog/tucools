# 图酷

一份页面，两种用法。压缩、裁剪等本地工具在浏览器里完成。抠图、优化和消除由引擎处理。页面只请求同源 `/api/engine`。

模型包单独下载，不在安装包和 Docker 镜像里。目录说明见 [docs/models.md](docs/models.md)。

## 本地开发

在仓库根目录按这个顺序做。引擎和页面各占一个终端，先启动引擎。

1. 安装页面依赖：

```powershell
npm install
```

2. 安装引擎依赖。本地用 Python 3.12 虚拟环境，`npm run engine` 会调用里面的解释器。镜像使用 Python 3.11。这一步包含 CPU 版 torch，体积较大：

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python -m pip install -r services\engine\requirements.txt
```

3. 准备模型包。只用本地工具可以跳过。AI 工具需要把模型包放到仓库根目录的 `model-pack`，或设置 `TUCOOLS_MODEL_PACK`。已有旧版运行时可以执行：

```powershell
powershell -File scripts/link-models.ps1
```

4. 启动引擎，监听 `127.0.0.1:8787`：

```powershell
npm run engine
```

确认 http://127.0.0.1:8787/api/engine/health 能打开。这个地址会列出抠图、优化、消除各自缺的文件。页面按功能分开检查：`/api/engine/health/cutout`、`/api/engine/health/enhance`、`/api/engine/health/erase`。对应的 AI 页面可以打开，但在没有可用模型时不能开始处理。

5. 另开一个终端，启动页面：

```powershell
npm run dev:web
```

打开 http://127.0.0.1:13175 。Vite 把 `/api/engine` 转到第 4 步的引擎。

## 桌面壳

页面先启动。桌面壳会打开开发页面；如果 8787 上还没有引擎，它会再尝试启动 Python 引擎。

```powershell
npm run dev:web
npm run dev:desktop
```

第二条命令放在另一个终端。本机没有 Python、但有旧的 `.runtime` 时，启动前设置：

```powershell
$env:TUCOOLS_RUNTIME = "E:\work-gt\gt-tucools\desktop\.runtime"
```

## 功能菜单

未设置时显示全部工具。要只开放一部分，在提供页面的进程里设置 `TUCOOLS_FEATURES`，值是逗号分隔的功能名：

```powershell
$env:TUCOOLS_FEATURES = "compress,resize,cutout"
```

开发时写在运行 `npm run dev:web` 的终端里。Docker 写在启动 Compose 的环境里。安装包读取启动时的环境变量；客户端还可以打开「功能菜单」，选择保存在本机。功能名见 [docs/deploy.md](docs/deploy.md)。

## Docker

先放好模型包，再启动。Compose 会先起引擎，再起页面。引擎不映射到宿主机。

```powershell
docker compose -f deploy/docker-compose.yml up --build
```

打开 http://127.0.0.1:8080 。

每个工具有独立地址，并提供简体中文、繁体中文、英语、西语、德语、日语、巴西葡语、印地语、越南语、阿拉伯语和孟加拉语。公开到自己的域名时，设置 `TUCOOLS_SITE_URL` 后再启动，站点地图、hreflang 和 `llms.txt` 会写成这个绝对地址。要接入 AdSense，再设置 `TUCOOLS_ADSENSE_CLIENT`。说明见 [docs/deploy.md](docs/deploy.md)。

## 发布

推送 `v0.2.0` 这样的标签后，GitHub Actions 会按标签中的版本构建 Windows 安装包和两个 Docker 镜像，并创建 Release。镜像发布到 GitHub Container Registry。步骤、拉取方式和安装包限制见 [docs/deploy.md](docs/deploy.md)。
