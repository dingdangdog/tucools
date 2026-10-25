# 032 裁剪二级地址

**日期：** 2026-10-26

## 背景 / 问题

收进裁剪的功能仍用各自的根地址，和「同属裁剪」对不上。

## 变更内容

- 自由裁剪仍是 `/cropping`。
- 证件照、社交尺寸、应用商店尺寸、圆形改为 `/cropping/id-photo`、`/cropping/sizes`、`/cropping/store`、`/cropping/tocircle`。语言前缀同样接在前面，例如 `/en/cropping/sizes`。
- 旧的 `/id-photo`、`/sizes`、`/store`、`/tocircle` 跳到新地址，查询参数保留。
- 功能名不变。切图仍是 `/cutting`。

## 影响范围

- `apps/web/src/router.ts`、`nav.ts`、`features.ts`、`stores/menus.ts`、`seo.ts`
- `docs/deploy.md`、`AGENTS.md`
- 站点地图和 Markdown 说明改用新地址。

## 数据库与兼容性

- 无数据库影响。
- 已公开的旧地址会跳转，不再作为收录地址。

## 验证

- `npm run typecheck` 通过。
- 已有开发服务 `http://127.0.0.1:13175/`：`/cropping` 的方式条指向 `/cropping`、`/cropping/id-photo`、`/cropping/sizes`、`/cropping/store`、`/cropping/tocircle`。
- `/cropping/store` 标题为应用商店尺寸，侧栏「裁剪」为当前项。
- `/id-photo?from=old` 跳到 `/cropping/id-photo?from=old`；`/en/sizes` 跳到 `/en/cropping/sizes`；`/tocircle` 跳到 `/cropping/tocircle`，方式条当前项为圆形。
- `/cutting` 仍是切图页，没有裁剪方式条，侧栏当前项为切图。

## 未做事项

- 未跑生产构建，未核对生成后的站点地图和 Markdown 文件。
