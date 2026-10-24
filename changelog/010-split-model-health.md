# 010 按功能分开检查模型

**日期：** 2026-10-24

## 背景 / 问题

抠图、优化和消除共用 `GET /api/engine/health`。打开其中一个页面时，会同时检查另外两个功能的模型；消除还会导入 torch 判断设备。一个功能缺文件时，检查结果和另外两个功能混在同一次响应里。

## 变更内容

- 新增 `GET /api/engine/health/cutout`、`/api/engine/health/enhance`、`/api/engine/health/erase`。每个地址只检查对应功能是否支持。
- 抠图和优化的单独检查不导入 torch。消除的单独检查才返回当前设备。
- AI 页面只请求当前功能的地址。没有可用模型时仍只停用这一页。
- 原来的 `GET /api/engine/health` 继续一次返回三个功能，供启动探测和人工查看。
- 旧命令行引擎按同样的路径分开检查。未知功能名返回 400。

## 影响范围

- `services/engine/runtime_info.py`、`services/engine/app.py`
- `apps/web/src/api/engine.ts`、`apps/web/src/components/EngineStatus.vue`、`apps/web/src/content/zh.ts`
- `apps/desktop/host.js`
- `README.md`、`docs/models.md`

## 数据库与兼容性

- 无数据库影响。
- 总览地址的字段不变。页面改为读取单功能地址，响应是扁平的 `ready`、`missing`、`available`。
- 抠图和优化可用时不再显示设备。消除仍显示当前设备。
- 模型文件仍不进入镜像和安装包。

## 验证

- `python -m py_compile services/engine/runtime_info.py services/engine/app.py`：通过。
- `node --check apps/desktop/host.js`：通过。
- `npm run typecheck`：通过。
- 直接调用三个单功能检查和总览：通过。当前环境三个功能都未就绪，结果一致。抠图和优化的检查没有导入 torch。消除返回设备 cpu。未知功能名返回 400。环境没有 httpx，没有经过 HTTP 层。
- 未启动页面、引擎或 Docker，未在浏览器里打开三个 AI 页面。

## 未做事项

- 未在安装包的旧命令行运行时里点按三个页面。
