# 011 调整侧栏分组

**日期：** 2026-10-24

## 背景 / 问题

侧栏先列出本地工具，再列出 AI 工具。去除信息和图片信息与压缩、裁剪放在同一组。首页没有单独的返回入口。嵌入提示的页面标题没有覆盖「AI提示词提取」这类叫法。

## 变更内容

- 侧栏最上增加「全部功能」，点击回到首页。只有停在首页时高亮。
- 分组顺序改为「AI 处理」「常规处理」「信息处理」。「本地处理」改名为「常规处理」。
- 「去除信息」「图片信息」「AI提示词提取」归入「信息处理」。
- 首页和安装包里的功能勾选页使用同一套分组。
- 提示词工具的菜单名改为「AI提示词提取」。页面说明和描述覆盖正向提示词、负向提示词、生成参数和 Stable Diffusion 写在文件中的绘图提示。功能名仍是 `prompt`。

## 影响范围

- `apps/web/src/nav.ts`、`features.ts`、`stores/menus.ts`、`router.ts`
- `apps/web/src/components/AppShell.vue`、`pages/HomePage.vue`、`pages/MenusPage.vue`
- `apps/web/src/content/zh.ts`、`apps/web/index.html`
- `docs/deploy.md`、`AGENTS.md`

## 数据库与兼容性

- 无数据库影响。
- `TUCOOLS_FEATURES` 仍使用原来的功能名，`prompt` 不用改。
- 安装包里已保存的功能勾选继续有效。隐藏分组后，「全部功能」仍然回到首页。
- 这个工具仍只读取 PNG tEXt/iTXt 和 JPEG APP1/COM，不做模型推理。

## 验证

- `npm run typecheck`：通过。
- 未启动页面，未在浏览器里点击侧栏、首页和提示词页面。

## 未做事项

- 未做服务端渲染。未执行 JavaScript 的抓取程序打开具体工具地址时，看到的是首页描述。
- 未新增博客或多语言页面。
