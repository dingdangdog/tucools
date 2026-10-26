# 036 使用说明改成面向使用者

**日期：** 2026-10-26

## 背景 / 问题

仓库首页按目录和开发栈来写，使用者看不到能做什么、怎么安装、模型从哪里下。页面上 Docker、客户端和模型的入口还是占位地址。模型包已经发布为 `model-pack.zip`。

## 变更内容

- `README.md` 改成使用说明：处理示例、功能、客户端安装包文件名、Docker 启动、模型下载和放置目录。开发启动只留到 `develop.md` 的链接。
- 抠图、优化、消除在不能使用时，Docker 和客户端都指向 `https://github.com/dingdangdog/tucools`，模型指向 `https://github.com/dingdangdog/tucools/releases/tag/models`。
- `docs/models.md` 的下载地址改为同一个模型发布页。

## 影响范围

- `README.md`
- `docs/models.md`
- `apps/web/src/release.ts`

## 数据库与兼容性

- 无数据库影响。
- 健康检查和引擎契约不变。
- 安装包和镜像仍不含模型包。

## 验证

- 对照 GitHub `models` 发布页：附件是 `model-pack.zip`，约 900MB。`v0.0.3` 发布说明里有安装包文件名，当前附件还没有这些安装包，README 写明了这种情况。
- 未再跑类型检查。这次只改了一个常量文件的三个字符串。
- 未在浏览器里点开这三个新链接。

## 未做事项

- 未替 `v0.0.3` 补上传安装包。
