# 044 去掉 Windows 安装目录里的 @tucoolsdesktop

**日期：** 2026-10-26

## 背景 / 问题

Windows 安装向导的默认目录是 `C:\Program Files\@tucoolsdesktop`。改成 `D:\Program Files\tucools` 后，程序仍全部落在 `@tucoolsdesktop` 子目录里。

electron-builder 25.1.8 只用英文、数字、空格和 `-_+.` 作为安装目录名。产品名「图酷」不符合，就退回 npm 包名 `@tucools/desktop`。斜杠被去掉后，目录名变成 `@tucoolsdesktop`。允许自选目录时，所选路径里如果没有这个名字，安装程序会把它再追加一层。

## 变更内容

- 打包元数据 `build.extraMetadata.name` 改为 `tucools`。产品名仍是「图酷」时，electron-builder 用这个名字作为 Windows 安装目录。
- 增加 `apps/desktop/build/installer.nsh`，再把安装目录名固定成 `tucools`。
- NSIS 配置显式引入这个脚本。
- 部署说明写明已经发布的安装包不会改变，本机留有旧安装记录时要先卸载。

## 影响范围

- `apps/desktop/build/installer.nsh`
- `apps/desktop/package.json`
- `docs/deploy.md`

## 数据库与兼容性

- 无数据库影响。
- 程序文件名仍是 `图酷.exe`，开始菜单名称仍是「图酷」。
- 打进安装包的 `package.json` 名称变为 `tucools`。以后打 Linux 包时，deb 包名也是 `tucools`。macOS 应用名仍是「图酷」。
- 已经发布的 `TuCools-0.0.6-windows-x64.exe` 仍会安装到 `@tucoolsdesktop`。需要用重新打包的安装程序。
- 旧版本若装在 `@tucoolsdesktop`，新安装程序不会把文件写进那个旧目录。先卸载再安装。

## 验证

- 对照 electron-builder 25.1.8：`getWindowsInstallationDirName` 在产品文件名含中文时返回净化后的包名 `@tucoolsdesktop`；`multiUser.nsh` 用它组成默认的 `Program Files` 路径；`assistedInstaller.nsh` 在自选路径不含该名字时追加子目录。自定义脚本在这两段模板之前把目录名改成 `tucools`，并用 `!if` 在名字不对时让打包失败。
- 本机用已安装的 Electron 35.7.5 重新打包。electron-builder 传给 NSIS 的 `APP_FILENAME` 是 `tucools`。产物是 `apps/desktop/release/TuCools-0.1.0-windows-x64.exe`。
- 未运行这个新安装包。
- 未发布到 GitHub Release。`TuCools-0.0.6-windows-x64.exe` 没有被改写。
