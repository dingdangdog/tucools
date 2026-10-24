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

安装包会优先使用随包的 `tucools-engine.exe`，否则使用 `TUCOOLS_RUNTIME` 里的 `erembg.exe`、`eenhance.exe`、`eerase.exe`。没有这些文件时，本地工具仍可用，AI 页会说明引擎未就绪。

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
