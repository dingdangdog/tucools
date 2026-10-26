# 040 客户端直接下载模型包

**日期：** 2026-10-26

## 背景 / 问题

模型包在 `models` 发布页，网页和 Docker 只能打开链接，由使用者自己下载和解压。客户端已经知道模型目录，仍把同一条链接交给使用者。

## 变更内容

- 客户端在抠图、优化、消除缺少模型时显示「下载并安装」。点击后下载 `model-pack.zip`，解压出 `models` 和 `bin`，放到当前模型目录，然后重新检查。
- 只缺一部分模型时，侧栏同样可以下载。引擎没有响应时也可以先把模型放好。
- 网页和 Docker 没有这个按钮，仍显示原来的发布页链接。
- 下载在 Electron 主进程进行，地址固定，页面不能改。可以取消。同一时间只处理一个下载。

## 影响范围

- `apps/desktop/main.js`
- `apps/desktop/preload.js`
- `apps/desktop/model-pack.js`
- `apps/desktop/package.json`
- `apps/web/src/components/ModelChoices.vue`
- `apps/web/src/components/ModelPackDownload.vue`
- `apps/web/src/components/EngineStatus.vue`
- `apps/web/src/model-pack-download.ts`
- `apps/web/src/content/` 各语言文案
- `docs/models.md`、`docs/deploy.md`、`README.md`

## 数据库与兼容性

- 无数据库影响。
- 安装包和镜像仍不含模型包。
- 模型目录规则不变。设置了 `TUCOOLS_MODEL_PACK` 时，下载结果放进该目录。
- 旧客户端没有下载接口时，页面仍显示发布页链接。

## 验证

- `node --test apps/desktop/model-pack.test.js`：解压、拒绝越界路径、重定向下载、缺少 `models`/`bin`、HTTP 错误和取消。
- `npm run typecheck` 通过。
- 浏览器打开正在运行的 http://127.0.0.1:13175/cutout 。没有客户端接口时仍是发布页链接。补上客户端接口后，抠图和优化显示「下载并安装」、目标目录和失败后的「打开发布页」；压缩页没有这个按钮。暗色、亮色和窄屏都看过。
- 未在客户端实际下载约 900MB 的 `model-pack.zip`。未在安装包里点按。

## 未做事项

- 未校验发布包哈希。
- 未在 Windows、macOS、Linux 安装包里点按「下载并安装」走完真实下载。
