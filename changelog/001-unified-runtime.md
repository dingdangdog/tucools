# 001 统一图酷页面与双端部署

## 目的

把图酷的本地 AI 能力和 EasyImage 的浏览器图像工具收成一个新产品：一份页面、一份引擎契约，同时支持 Docker 浏览器和 Windows 安装包。

## 变更内容

- 新增 Vite + Vue 工作台，覆盖压缩、缩放、转格式、裁剪、证件照尺寸、社交尺寸、切图、水印、加字、灰度、圆形、去除信息、图转 PDF、Favicon、嵌入提示、图片信息和三个 AI 工具。
- 新增 FastAPI 引擎，抠图、优化、消除共用健康检查、单任务和 SSE。
- 新增 nginx + 引擎的 Docker Compose，以及 Electron 本地静态服务、旧 `.runtime` 命令行网关和 Windows NSIS 配置。
- 不迁移激活、支付、博客、广告和 11 语站点。

## 影响范围

- 新仓库 `E:\Code\tucools`。未修改 `E:\work-gt\gt-tucools\desktop` 和 `E:\Code\easyimage.work`。
- 无数据库。

## 验证

- `vue-tsc --noEmit` 通过。
- `vite build` 通过。
- Python 语法编译通过。未安装模型时，健康检查列出缺失的模型文件。
- 浏览器打开开发页面：压缩一张生成的 PNG 得到 `dot.jpg`；抠图页在引擎未启动时提示引擎没有响应；主题可切换；390px 宽度下侧栏收起，工具按钮可见。
- 未安装 torch，未构建 Docker 镜像，未打 Windows 安装包，未用真实模型跑通抠图、优化和消除。

## 未做

- 把 PyTorch 打进安装包。
- 提供 Linux 版 `upscayl-bin`。没有它时，Docker 里的优化不可用。
- macOS 与 Linux 安装包。
