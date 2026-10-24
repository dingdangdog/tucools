# 018 模型状态改到操作按钮同一行

**日期：** 2026-10-24

## 背景 / 问题

抠图、优化、消除在功能可用时，「这个功能可用。」和「重新检查」单独占设置区一块，把模型选项往下推。

## 变更内容

- 功能可用时的状态文字，以及「重新检查」，改到「开始抠图」「开始优化」「开始消除」同一行。
- 引擎无响应、正在检查、缺少模型时，说明仍留在设置区。「重新检查」仍在操作行。
- 还有部分模型未安装时，缺文件说明留在设置区。

## 影响范围

- `apps/web/src/components/EngineStatus.vue`
- `apps/web/src/components/EngineHealthActions.vue`
- `apps/web/src/components/StudioLayout.vue`
- `apps/web/src/pages/CutoutPage.vue`
- `apps/web/src/pages/EnhancePage.vue`
- `apps/web/src/pages/ErasePage.vue`
- `apps/web/src/engine-gate.ts`

## 数据库与兼容性

- 无数据库影响。
- 健康检查地址和引擎契约不变。

## 验证

- `npm run typecheck`：通过。
- 浏览器打开已在运行的页面：抠图、优化、消除在功能可用时，状态和「重新检查」与开始按钮同一行，行高约 44px。抠图页点击「重新检查」后按钮会暂时禁用，检查结束恢复，模型选项仍在。390px 宽时这一行不溢出。未切换亮色主题。
