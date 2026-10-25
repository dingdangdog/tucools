# 034 英文名 TuCools 与 EasyImage 收录

**日期：** 2026-10-26

## 背景 / 问题

图酷的英文名是 TuCools。easyimage.work 以后可能直接部署图酷，搜索里仍会用 EasyImage、简单图片和原来的工具叫法。

## 变更内容

- 英语界面的产品名、文档标题和站点名改为 TuCools。简体中文和其他语言界面仍显示「图酷」。
- 各语言首页说明和一条常见问题写明：TuCools、EasyImage、easyimage.work 是同一系列，本地处理仍在浏览器完成。
- 旧站有对应能力的工具各加一条常见问题，使用原来的叫法，例如图片压缩、图片分割、黑白化、证件照和护照照片尺寸、AI 图片提示词解析。抠图、优化、消除和应用商店尺寸没有对应旧工具，不加这条。
- 关键词，以及组织与网站的 `alternateName`，带上 TuCools、图酷、EasyImage、简单图片（各语言里的旧称）和 easyimage.work。当前访问的域名不是 easyimage.work 时，`sameAs` 增加 `https://easyimage.work/`。已经部署在这个域名上时，不把本站再写成外部同一实体。
- 不把 HEIC 转 JPG 和 PWA 写进收录。当前转格式不提供这些独立页面。

## 影响范围

- `apps/web/src/content/` 全部语言
- `apps/web/src/seo.ts`
- `AGENTS.md`
- `docs/deploy.md`

## 数据库与兼容性

- 无数据库变化。工具地址不变。
- 已有旧地址跳转仍是 `/id-photo`、`/sizes`、`/store`、`/tocircle` 和 `/zh`。

## 验证

- `npm run typecheck` 通过。
- `assertDiscoveryPatterns()` 通过：压缩说明含 EasyImage 与「图片压缩」，简体 `llms.txt` 含 TuCools 与「简单图片」，部署域名是 easyimage.work 时 `sameAs` 不指向本站。
- 已有开发服务 `http://127.0.0.1:13175/`：`/en` 侧栏和标题为 TuCools，首页问题写明与 EasyImage 的关系。`/en/compress` 标题为 Compress images online without uploading · TuCools，并有 EasyImage image compression 问题。`/compress` 品牌仍是图酷，关键词含图片压缩、TuCools、简单图片、EasyImage、easyimage.work。`/cutout` 没有按旧工具追加的问题。`/llms.txt` 与 `/compress.md` 含这些名称。

## 未做事项

- 未把 `/compress/jpeg`、`/converter/jpg-to-png` 等格式页、`/cutting/grid`、`/ai-analysis`、`/pix-analysis` 做成跳转。
- 未在浏览器里逐语言点开全部工具问题。英语问题文案在验证之后改过一处所有格，未再跑一遍收录断言。
