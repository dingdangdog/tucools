# 024 避免 Windows 打包删掉 app-builder

**日期：** 2026-10-25

## 背景 / 问题

固定 Electron 版本后，Windows 安装包任务仍在 `electron-builder` 处失败。日志停在 `installing production dependencies`，随后找不到 `node_modules\app-builder-bin\win\x64\app-builder.exe`。

npm workspaces 把依赖提升到仓库根目录，`apps/desktop` 下没有 `node_modules`。electron-builder 25.1.8 因此在这个目录执行 `npm install --production`。该命令会按生产依赖修剪仓库根目录，删掉 `app-builder-bin`，紧接着的依赖收集再去启动这个程序。

## 变更内容

- 在 `@tucools/desktop` 的 `build.npmRebuild` 设置为 `false`，跳过这次安装和原生模块重建。
- 部署说明写明必须保持该设置。桌面壳没有原生模块，`busboy` 仍从仓库根目录收集。

## 影响范围

- `apps/desktop/package.json`
- `docs/deploy.md`

## 数据库与兼容性

- 无数据库影响。
- 安装包内容不变：页面、桌面壳和生产依赖 `busboy`。不含模型包，也不含 `tucools-engine.exe`。
- 以后如果桌面壳加入原生模块，不能只把 `npmRebuild` 改回 `true`，需要同时避免在工作区包目录执行 `npm install --production`。

## 验证

- 对照 electron-builder 25.1.8 的 `installAppDependencies`：`npmRebuild: false` 时直接返回，且不会把依赖收集标成外部处理。
- 未在本机运行 `npm run package:win`，未重新推送版本标签。
