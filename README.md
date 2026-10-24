# 图酷

图酷是一套图像工具。同一份页面有两种用法：Windows 安装包在本机打开，Docker 用浏览器打开。

常规处理和信息处理在浏览器里完成，图片留在本机。抠图、优化和消除由引擎处理，页面只请求同源 `/api/engine`。模型包单独下载，说明见 [docs/models.md](docs/models.md)。

仓库地址：[github.com/dingdangdog/tucools](https://github.com/dingdangdog/tucools)。安装包、镜像和模型包的发布页：[Releases](https://github.com/dingdangdog/tucools/releases)。

## 功能

**AI 处理**需要模型包。

- 抠图：去掉背景，导出透明 PNG。
- 优化：按所选效果放大并增强画面。
- 消除：涂抹要去掉的区域，再由引擎补全。

**常规处理**在浏览器里完成。

- 压缩、缩放、转格式、裁剪。
- 证件照尺寸、社交尺寸、应用商店尺寸。证件照尺寸只裁切和铺底色。
- 切图、水印、加字、灰度、圆形。
- 图转 PDF、Favicon。

**信息处理**在浏览器里完成。

- 去除信息：查看 EXIF，再导出不含元数据的新图。
- 图片信息：查看 EXIF，并可导出 JSON。
- AI 提示词提取：读取 PNG、JPEG 里嵌入的提示词和生成参数。

## 使用

| 方式 | 打开地址 | 说明 |
| --- | --- | --- |
| Windows 安装包 | 本机窗口 | 页面和壳在安装包里。模型包解压到 `%APPDATA%\tucools\model-pack`，或设置 `TUCOOLS_MODEL_PACK`。 |
| Docker | http://127.0.0.1:8080 | 已发布镜像用 `docker compose -f deploy/docker-compose.deploy.yml up -d`。从源码构建用 `docker compose -f deploy/docker-compose.yml up --build`。引擎留在 Compose 网络内。 |

部署、功能菜单、站点地址、广告和统计见 [docs/deploy.md](docs/deploy.md)。

默认语言是简体中文，地址不带前缀。另有繁体中文、英语、西班牙语、德语、日语、巴西葡萄牙语、印地语、越南语、阿拉伯语和孟加拉语，对应 `/zh_hant`、`/en`、`/es`、`/de`、`/ja`、`/pt_br`、`/hi`、`/vn`、`/ar`、`/bn`。产品名在每种语言里都是「图酷」。

## 目录

| 路径 | 职责 |
| --- | --- |
| `apps/web` | 页面。Vite、Vue 3、Vue Router、Pinia、Tailwind。 |
| `services/engine` | 引擎。FastAPI，提供抠图、优化和消除。 |
| `apps/desktop` | Windows 安装包。Electron 提供静态页并转发 `/api/engine`。 |
| `deploy/` | nginx、Dockerfile、Compose 和模型包清单。 |
| `docs/` | 部署与模型包说明。 |

## 开发

本地启动、桌面壳和发布步骤见 [develop.md](develop.md)。仓库约定见 [AGENTS.md](AGENTS.md)。
