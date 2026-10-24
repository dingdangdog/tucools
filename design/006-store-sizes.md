# 006 应用商店尺寸

**日期：** 2026-10-24

## 背景

社交尺寸只覆盖社交平台。应用商店上架还需要另一组固定像素：App Store 的 iPhone、iPad、Mac、iPhone Duo，以及 Google Play 和 Chrome 网上应用店的图标、截图和宣传图。这些尺寸应在浏览器本地生成，不请求引擎。

## 方案

新的本地工具地址是 `/store`，功能名是 `store`。一次放入一张图，按已选尺寸导出 PNG 或 JPEG。每张结果可以下载或复制到剪贴板，多张可以打包下载。

放入方式有四种：留白完整显示、铺满并裁切、拉伸、按原图像素平铺。竖屏、横屏和两者都生成只作用于标记为可旋转的截图。图标、Mac 和像素被商店写死的宣传图保持原尺寸。底色可选透明、白、黑或自定义。选 JPEG 且底色为透明时，先铺白底，因为 JPEG 没有透明通道。

默认勾选各商店当前最常用、且规范里明确写出的尺寸。平台芯片上的数字是该组已选数量，避免只看当前组时漏掉其他平台。更小的旧设备档位不单列；商店会用较大截图缩放。

## 尺寸来源

核对日期是 2026-10-24。

- App Store 截图：[Screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/)。iPhone 必传档是灵动岛中屏，接受 1206×2622 或 1179×2556。iPad 必传档是 13 英寸，接受 2064×2752 或 2048×2732。Mac 只接受 2880×1800、2560×1600、1440×900、1280×800。iPhone Duo 外屏是 1398×2034，内屏是 2007×2853；横屏为对调。App Store 图标沿用 1024×1024。
- Google Play：[Add preview assets](https://support.google.com/googleplay/android-developer/answer/9866151)。图标 512×512，置顶大图 1024×500，电视横幅 1280×720，Wear OS 至少 384×384。手机截图采用规范中的 9:16 下限 1080×1920；平板采用同规则内的 1440×2560，不是唯一合法尺寸。
- Chrome 网上应用店：[Supplying Images](https://developer.chrome.com/docs/webstore/images)。图标 128×128，截图 1280×800 或 640×400，小宣传图 440×280，大宣传图 1400×560。

未列入 Apple Watch、Apple TV、Apple Vision Pro 和 Microsoft Store。

## 兼容性

原有工具地址不变。`TUCOOLS_FEATURES` 增加 `store`。图片不上传。
