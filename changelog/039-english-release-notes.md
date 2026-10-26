# 039 Release 说明改为英文

**日期：** 2026-10-26

## 背景 / 问题

GitHub Release 的正文由 `.github/scripts/release-notes.md` 在第一次创建时生成，原来是中文。

## 变更内容

- 发布说明模板改为英文。版本号、镜像名和部署命令的占位符不变。
- 部署说明写明正文语言是英文，并且已有 Release 不会被模板更新覆盖。

## 影响范围

- `.github/scripts/release-notes.md`
- `docs/deploy.md`
- `design/008-independent-release-workflows.md`

## 数据库与兼容性

- 无数据库影响。
- `ensure-release.sh` 在 Release 已存在时仍保留原来的说明。`v0.0.4` 如果已经创建，下一次构建不会把正文换成英文。
- 安装包文件名、镜像标签和校验文件名不变。

## 验证

- 用模板替换 `__VERSION__`、`__WEB_IMAGE__`、`__ENGINE_IMAGE__` 后，结果中没有这三个占位符，也没有中文字符。
- 未创建或修改 GitHub Release。
