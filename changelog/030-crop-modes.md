# 030 裁剪收成一个菜单

**日期：** 2026-10-26

## 背景 / 问题

自由裁剪、证件照尺寸、切图和圆形都是在裁切画面，侧栏和首页却各占一项。菜单变长，同类功能也不好来回切换。

## 变更内容

- 侧栏、首页和功能菜单只保留一个「裁剪」。
- `/cropping`、`/id-photo`、`/cutting`、`/tocircle` 仍是各自的地址。进入其中任一地址后，标题下方用同一排切换。
- 社交尺寸和应用商店尺寸仍是独立菜单。它们是把图片放进目标尺寸，不并入裁剪。
- `TUCOOLS_FEATURES` 写出 `cropping` 时，四个裁剪地址都可用。只写出 `id-photo`、`cutting` 或 `tocircle` 时，菜单仍显示「裁剪」，但只能进入写出的地址。
- 安装包里旧的功能选择如果还留着上述任一裁剪名，会保留「裁剪」这一项。

## 影响范围

- `apps/web/src/nav.ts`、`features.ts`、`stores/menus.ts`、`router.ts`
- `apps/web/src/components/AppShell.vue`、`CropModes.vue`、`pages/HomePage.vue`、`styles.css`
- `apps/web/src/content/` 各语言
- `docs/deploy.md`、`AGENTS.md`

## 数据库与兼容性

- 无数据库影响。
- 四个地址、收录页和语言前缀不变。
- 本机若曾单独关掉「裁剪」、只留下证件照、切图或圆形，更新后会重新显示「裁剪」，四个方式按当前部署上限一起出现。

## 验证

- `npm run typecheck`：通过。
- 已有开发服务 `http://127.0.0.1:13175/`。英文首页和侧栏只有一个 Crop，社交尺寸和应用商店尺寸仍单独列出。
- `/en/cropping`、`/en/id-photo`、`/en/cutting`、`/en/tocircle` 都能打开，标题下的切换会改地址，侧栏的 Crop 保持选中。
- `/cropping` 为简体中文，切换是「裁剪、证件照尺寸、切图、圆形」。亮色下选中项仍能看清。
- 390 宽时侧栏收起，四个切换仍排在标题下。`/ar/cropping` 为从右向左，切换从右侧开始。

## 未做事项

- 未测试 `TUCOOLS_FEATURES` 只开放部分裁剪地址。
- 未测试安装包里的旧功能选择。
- 未上传图片做裁剪、证件照、切图或圆形的导出。
