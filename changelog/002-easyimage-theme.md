# 002 界面改用 EasyImage 配色

**日期：** 2026-10-23

## 背景 / 问题

工作台已能切换明暗主题，但配色是暖纸色和青色，和 EasyImage 的蓝灰主题不一致。

## 变更内容

- 亮色改为石板底、白色表面、蓝色强调。
- 暗色改为中性黑底、蓝色强调，未保存选择时默认暗色。
- 侧栏选中和悬停跟随同一套颜色，不再使用只适合深色底的白色叠层。

## 影响范围

- `apps/web/src/styles.css`
- `apps/web/src/components/AppShell.vue`
- `apps/web/index.html`
- `apps/web/src/pages/HomePage.vue`

## 数据库与兼容性

- 无数据库影响。已保存的 `tucools-theme` 仍会生效。

## 验证

- 浏览器核对压缩页：亮色背景为石板灰、按钮为蓝色；暗色背景为中性黑、按钮为亮蓝。主题按钮可在两者之间切换。

## 未做事项

- 未引入 EasyImage 的 11 语和营销页样式。
