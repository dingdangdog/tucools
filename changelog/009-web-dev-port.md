# 009 开发页面默认端口改为 13175

**日期：** 2026-10-24

## 背景 / 问题

`npm run dev:web` 使用 Vite 默认端口 5173。需要改成 13175，并让桌面壳在未设置 `TUCOOLS_WEB_URL` 时仍能打开同一地址。

## 变更内容

- 开发页监听 `127.0.0.1:13175`。命令行参数和 Vite 配置一致。
- 桌面壳开发模式的默认页面地址改为 `http://127.0.0.1:13175`。设置 `TUCOOLS_WEB_URL` 时仍以该变量为准。
- README 和部署说明中的开发地址同步更新。

## 影响范围

- `apps/web/package.json`、`apps/web/vite.config.ts`
- `apps/desktop/main.js`
- `README.md`、`docs/deploy.md`

## 数据库与兼容性

- 无数据库影响。
- Docker 页面仍映射 `8080:8080`。安装包仍由本机随机端口提供静态页。
- 引擎仍监听 `127.0.0.1:8787`。

## 验证

- `node --check apps/desktop/main.js`：通过。
- 未启动开发页面，未在浏览器中打开新端口。

## 未做事项

- 未运行 `npm run dev:web` 确认 13175 实际监听。
