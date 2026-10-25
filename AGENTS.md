# 图酷仓库说明

图酷是一份页面、两种部署：安装包在本机打开，Docker 用浏览器打开。本地图像工具在页面里完成；抠图、优化、消除只请求同源 `/api/engine`。算法以 `services/engine` 为准。

面向用户的回复和仓库文档用简体中文。代码标识保持现有英文命名。

## 先读哪里

1. 本文件。
2. 与需求相关的现有页面、路由和工具函数，再改。
3. 架构边界看 `design/001-unified-runtime.md`。其中 4.4 的暖纸色、深青和「暗色不是默认」已过时；配色以 `apps/web/src/styles.css` 和 `apps/web/index.html` 为准。
4. 启动顺序看根目录 `develop.md`。部署和模型包看 `docs/deploy.md`、`docs/models.md`。
5. 旧项目只作对照，不修改：`E:\work-gt\gt-tucools\desktop`、`E:\Code\easyimage.work`。

## 目录

| 路径 | 职责 |
| --- | --- |
| `apps/web` | Vite + Vue 3 + Vue Router + Pinia + Tailwind。唯一界面。 |
| `apps/web/src/content/` | 界面文案。`zh.ts` 定义 `Copy`，其余语言文件必须符合这个类型。 |
| `apps/web/src/router.ts` | 路由。 |
| `apps/web/src/nav.ts` | 「全部功能」「AI 处理」「常规处理」「信息处理」导航。 |
| `apps/web/src/utils` | 浏览器内图像算法。 |
| `apps/web/src/api/engine.ts` | 引擎请求。页面不写死引擎地址。 |
| `services/engine` | FastAPI。`app.py` 是契约，`vendor/` 是算法，`runtime_info.py` 是模型就绪检查。 |
| `apps/desktop` | Electron。`host.js` 提供静态页并转发 `/api/engine`。 |
| `deploy/` | nginx、两个 Dockerfile、compose、`model-pack.json`。 |
| `docs/` | 使用与部署说明。 |
| `design/` | 架构和复杂方案。 |
| `changelog/` | 三位编号变更记录。 |

## 不能破坏的边界

- 同一份 `apps/web` 构建结果给 Docker 和安装包用。不要做第二套界面，不要把 AI 推理搬进浏览器。
- 本地工具不上传。证件照尺寸只裁切和铺底色，不抠图。AI提示词提取只读取 PNG tEXt/iTXt 和 JPEG APP1/COM，不做推理。
- 裁剪、证件照尺寸、社交尺寸、应用商店尺寸和圆形共用侧栏和首页的一个「裁剪」。自由裁剪地址是 `/cropping`，其余是 `/cropping/id-photo`、`/cropping/sizes`、`/cropping/store`、`/cropping/tocircle`。旧地址跳到新地址。切图保持独立菜单 `/cutting`。
- AI 页面只走 `/api/engine`。开发时 Vite 代理到 `127.0.0.1:8787`；部署时由 nginx 或 Electron 反代。
- 引擎同时只处理一个任务。忙时 409。缺模型或缺参数时 400，并写明缺什么。上传上限 50MB。
- 模型包单独下载，目录由 `TUCOOLS_MODEL_PACK` 指定。权重在 `models/`，超分程序在 `bin/<平台>/`。清单见 `deploy/model-pack.json`。不得把 `model-pack`、权重或 upscayl 打进 Git、安装包或镜像。
- 引擎只监听本机，或只留在 Compose 网络内。不要把引擎端口暴露到公网。没有登录。
- 超分调用 upscayl-bin，不安装 Python 版 realesrgan。Linux 容器不能运行 `upscayl-bin.exe`。
- 桌面引擎顺序：随包 `tucools-engine.exe`，否则 `TUCOOLS_RUNTIME` 里的旧命令行，否则本机 Python。旧命令行只组装参数，不重写算法。
- 安装包做 Windows x64 NSIS、macOS dmg/zip（arm64 与 x64）和 Linux x64 AppImage/deb。产品名「图酷」，`appId` 为 `com.tucools.app`。没有代码签名。三个平台的构建互不依赖。
- 不做激活、支付、试用、博客、上色、美颜、人脸修复。广告默认关闭。公开站点用 `TUCOOLS_ADSENSE_CLIENT` 接入 AdSense 并生成 `/ads.txt`；再设置 `TUCOOLS_ADSENSE_SLOT` 时，工具页右侧显示该广告单元。未配置时不加载广告脚本。安装包默认不配置。统计默认关闭。公开站点用 `TUCOOLS_ANALYTICS_ID` 接入 Google Analytics 4。未配置时不加载 gtag.js。安装包默认不配置。
- 默认语言是简体中文，地址不带前缀。其他语言使用 `/en`、`/zh_hant`、`/es`、`/de`、`/ja`、`/pt_br`、`/hi`、`/vn`、`/ar`、`/bn`。简体中文和其他非英语界面的产品名是「图酷」，英语界面是「TuCools」。网页不按 `Accept-Language` 跳转；`localStorage` 键 `tucools-locale` 只在打开站点根 `/` 时生效。安装包第一次打开根地址、且没有保存语言时，按系统语言选择。阿拉伯语页面使用 `dir="rtl"`。公开站点的绝对规范地址在构建时读取 `VITE_SITE_URL`，容器启动时读取 `TUCOOLS_SITE_URL`。每个可索引页面另有 Markdown，`llms.txt` 指向这些文件。`robots.txt` 用 Content-Signal 允许搜索、生成式引用和训练。广告编号和统计测量 ID 也在容器启动时读取，不写进镜像。

## 接到需求后怎么改

先判断落在哪一层，只改这条链路，并保持两端契约一致。

| 需求 | 改哪里 |
| --- | --- |
| 新的本地图像工具 | `nav.ts` 里按分组写入 `aiNav`、`localNav` 或 `infoNav`，再改 `router.ts`、`pages/` 里最接近的页面、`utils/`、`zh.ts` 以及 `content/` 里其余语言。不请求引擎。 |
| 调整本地算法或导出结果 | 对应 `utils/*.ts` 和调用它的页面。结果列表继续用 `useResults()`。 |
| 新的或变更的 AI 能力 | `services/engine/app.py` 的路由与校验、`vendor/` 的算法、`runtime_info.py` 的就绪条件、对应 AI 页面、`zh.ts` 以及 `content/` 里其余语言。健康检查要能指出缺的文件。 |
| 改抠图、优化、消除参数 | 页面表单和 `app.py` 的 Form 一起改。优化效果名以 `ENHANCE_MODELS` 为准。 |
| 改配色或主题 | 只改 `styles.css` 的令牌，以及 `index.html` 里首屏主题脚本。组件使用已有变量，不写死颜色。 |
| 改文案 | 先改 `zh.ts`，再改 `content/` 里每一种语言，使它们继续符合 `Copy`。 |
| 改模型文件名或目录 | `runtime_info.py`、`deploy/model-pack.json`、`docs/models.md`，以及安装包过滤和镜像忽略规则。 |
| 改安装或 Docker | `apps/desktop`、`deploy/`、`docs/deploy.md`。镜像和安装包仍不包含模型包。 |
| 改广告或统计 | `TUCOOLS_ADSENSE_CLIENT`、`TUCOOLS_ADSENSE_SLOT`、`TUCOOLS_ANALYTICS_ID`，以及入口脚本、`app-config.json`、`/ads.txt` 和工具页右侧。不把发布商编号或测量 ID 写进仓库。 |

新增本地工具时，批量工具沿用 `BatchLayout`、`Stage`、`Chips`、`Field`、`ResultGrid`；需要对照原图操作的工具沿用 `StudioLayout` 和 `Stage`。新增 AI 工具时，沿用 `StudioLayout`、`EngineStatus`，并用 `runEngineJob` 接收 SSE。`useResults()` 必须返回 `reactive({...})`；返回普通对象会导致模板拿到 Ref 本身。

主题：`localStorage` 键是 `tucools-theme`。显式 `light`、`dark`、`system` 按其值生效；没有保存值时默认暗色。亮色是浅灰底、白表面和蓝色强调，暗色是近黑底、抬升表面和蓝色强调。窄屏收起侧栏。宽屏可收成图标栏，状态在 `tucools-nav-rail`。

保存文件：安装包里走 `window.tucools.saveBytes`；浏览器里直接下载。不要在页面里分叉两套结果数据。

## 工作方式

- 先看相关实现和 `git status`，不覆盖用户已有改动。
- 说明和排障写入 `docs/`。复杂方案写入 `design/`，使用下一位编号。
- 改了代码或可执行脚本后，在 `changelog/` 增加三位编号记录。先看已有编号，当前最大是 `033`。记录写明问题、改动、影响、兼容性和实际验证；未跑的检查写「未测试」。
- 未经要求不启动开发服务器、Docker、安装包构建或长期进程。可以跑 `npm run typecheck`、`npm run build:web` 和针对改动文件的 Python 语法检查。
- 不把未安装依赖时的推理、镜像构建或安装包打包写成已通过。
- 不读取或提交 `.env`、密钥和真实用户图片。不修改两个旧项目。

## 命令

在仓库根目录：

```powershell
npm install
npm run dev:web
npm run engine
npm run dev:desktop
npm run typecheck
npm run build:web
npm run package:win
npm run package:mac
npm run package:linux
docker compose -f deploy/docker-compose.yml -f deploy/docker-compose.gpu.yml up --build
docker compose -f deploy/docker-compose.deploy.yml -f deploy/docker-compose.gpu.yml up -d
```

`npm run engine` 使用仓库根目录 `.venv` 里的 Python 3.12，依赖按 `services/engine/requirements.txt` 装进这个环境。模型包默认是仓库根目录的 `model-pack`；已有旧运行时时可用 `scripts/link-models.ps1` 在本机准备，该脚本不会把模型放进安装包或镜像。没有 NVIDIA GPU 时，去掉上面 Docker 命令里的 `-f deploy/docker-compose.gpu.yml`。

`npm run package:mac` 在 macOS 上使用，`npm run package:linux` 在 Linux 上使用。推送版本标签不会构建。页面镜像、引擎镜像和三个平台的安装包在 GitHub Actions 里分开手动运行，可以同时进行。说明见 `docs/deploy.md`。
