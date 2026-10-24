export const zh = {
  appName: "图酷",
  tagline: "图像工具",
  language: "语言",
  allFeatures: "全部功能",
  aiGroup: "AI 处理",
  localGroup: "常规处理",
  infoGroup: "信息处理",
  openNav: "工具",
  closeNav: "关闭",
  themeToDark: "切换到暗色",
  themeToLight: "切换到亮色",
  empty: "把图片拖到这里，或选择文件",
  choose: "选择文件",
  processing: "正在处理",
  download: "下载",
  downloadAll: "打包下载",
  clear: "清空",
  saveAs: "保存到…",
  failed: "处理失败",
  noImage: "请放入图片文件",
  engineDown: "引擎没有响应。请先启动本机引擎或 Docker 中的引擎。",
  engineMissing: "还缺这些文件",
  modelPackHint: "模型包单独下载，解压到这个目录后再检查：",
  refreshHealth: "重新检查",
  modelChecking: "正在检查模型",
  modelBlocked: "没有可用模型，这个功能已停用。",
  modelUnavailable: "这个功能暂时不能使用",
  modelLinksLead: "模型包和客户端新版本发布在图酷仓库。",
  modelRepo: "仓库",
  modelReleases: "发布页",
  modelPartial: "还有部分模型未安装",
  featureReady: "这个功能可用。",
  currentDevice: "当前设备",
  menus: {
    title: "功能菜单",
    open: "功能菜单",
    lead: "选择要在这台设备上显示的工具。选择保存在这台设备上。",
    capped: "当前部署只开放下面这些工具。勾选结果保存在这台设备上。",
    browserLead: "浏览器部署用环境变量 TUCOOLS_FEATURES 决定显示哪些工具，用逗号分开功能名。未设置时显示全部。",
    browserCurrent: "当前显示",
    showAll: "显示允许的全部功能",
    empty: "当前没有可显示的工具。",
  },
  homeLead: "常规处理和信息处理在这台设备的浏览器里完成。抠图、优化和消除交给同一个引擎，安装包和 Docker 用的是同一份页面。",
  tools: {
    home: { title: "开始", lead: "选择左侧工具。" },
    compress: { title: "压缩", lead: "按质量、最长边或目标体积压缩 JPEG、PNG、WebP。" },
    resize: { title: "缩放", lead: "按指定宽高缩放，也可以留白放入画布。" },
    converter: { title: "转格式", lead: "在 PNG、JPEG、WebP、BMP、ICO 之间转换。" },
    cropping: { title: "裁剪", lead: "框选、旋转后导出 PNG。" },
    idPhoto: { title: "证件照尺寸", lead: "按常见像素裁成证件照比例，并铺上底色。这里不抠图。" },
    sizes: { title: "社交尺寸", lead: "把图片放到常见的社交平台尺寸里。" },
    cutting: { title: "切图", lead: "按竖线、横线、斜线或宫格切开，也可以再拼回去。" },
    watermark: { title: "水印", lead: "给图片加上文字水印。" },
    caption: { title: "加字", lead: "在画面中央加上一行大字。" },
    fade: { title: "灰度", lead: "把图片转成灰度。" },
    tocircle: { title: "圆形", lead: "按直径裁成圆形。" },
    exif: { title: "去除信息", lead: "查看 EXIF，再重绘成不含元数据的新图。" },
    pdf: { title: "图转 PDF", lead: "多张图片各成一页，导出 PDF。" },
    favicon: { title: "Favicon", lead: "导出 16、32、48、180 的 PNG 和一个 ICO。" },
    prompt: {
      title: "AI提示词提取",
      lead: "从 PNG、JPEG 中提取嵌入的 AI 提示词、负向提示词和生成参数。不上传，也不做模型推理。",
    },
    pix: { title: "图片信息", lead: "查看 EXIF，并可导出 JSON。" },
    cutout: { title: "抠图", lead: "去掉背景，导出透明 PNG。" },
    enhance: { title: "优化", lead: "按所选效果放大并增强画面。" },
    erase: { title: "消除", lead: "涂抹要去掉的区域，再交给引擎补全。" },
  },
  seo: {
    faqHeading: "常见问题",
    listName: "图酷的图像工具",
    boundary:
      "常规处理和信息处理在浏览器本地完成。抠图、优化和消除只请求同源 /api/engine，不经过第三方。模型包单独下载，不在安装包和镜像里。证件照尺寸只裁切和铺底色。AI提示词提取只读取文件中已有的文本，不做推理。",
    omitHeading: "不作为工具说明引用",
    missingTitle: "页面不存在",
    missingBody: "这个地址没有对应的工具。",
    backHome: "回到开始",
    homeDescription:
      "图酷为压缩、缩放、转格式、裁剪、证件照尺寸、社交尺寸、切图、水印、加字、灰度、圆形、图转 PDF、Favicon、去除信息、图片信息和 AI提示词提取提供独立地址，并在浏览器本地处理。抠图、优化和消除只请求同源引擎。",
    homeFaqs: [
      {
        q: "图片会上传到服务器吗？",
        a: "常规处理和信息处理在这台设备的浏览器里完成，图片不会上传。抠图、优化和消除只请求当前站点的 /api/engine，不经过第三方。",
      },
      {
        q: "安装包和网页是同一套工具吗？",
        a: "是。Docker 和 Windows 安装包使用同一份页面。模型包要单独下载，不在安装包和镜像里。",
      },
    ],
    tools: {
      cutout: {
        description: "去掉背景并导出透明 PNG。请求只发到当前站点的引擎，不经过第三方。没有可用模型时不能开始。",
        faqs: [
          {
            q: "抠图结果是什么？",
            a: "去掉背景，导出透明 PNG。页面只列出当前已经安装、可以使用的模型。",
          },
          {
            q: "图片会送到第三方吗？",
            a: "不会。请求只发到当前站点的 /api/engine。上传上限 50MB，引擎同时只处理一个任务。没有可用模型时不能开始。",
          },
        ],
      },
      enhance: {
        description: "按已安装的效果放大并增强画面。请求只发到当前站点的引擎。没有可用模型时不能开始。",
        faqs: [
          {
            q: "优化会做什么？",
            a: "按所选效果放大并增强画面。页面只列出当前已经安装、可以使用的效果。",
          },
          {
            q: "图片会送到第三方吗？",
            a: "不会。请求只发到当前站点的 /api/engine。没有可用模型时不能开始。Linux 容器还需要模型包里的 upscayl-bin。",
          },
        ],
      },
      erase: {
        description: "涂抹要去掉的区域，由当前站点的引擎补全。没有可用模型时不能开始，图片不经过第三方。",
        faqs: [
          {
            q: "怎样指定要消除的区域？",
            a: "在画面上涂抹。白色笔迹作为蒙版交给引擎补全，可以清除后重新涂抹。",
          },
          {
            q: "图片会送到第三方吗？",
            a: "不会。请求只发到当前站点的 /api/engine。上传上限 50MB。没有可用模型时不能开始。",
          },
        ],
      },
      compress: {
        description: "在浏览器本地压缩 JPEG、PNG 和 WebP，可按质量、最长边或目标体积处理。图片不会上传。",
        faqs: [
          {
            q: "可以压到指定体积吗？",
            a: "可以按质量、最长边或目标体积压缩 JPEG、PNG、WebP。目标体积填 0 表示不限制。PNG 按像素压缩，质量滑杆不生效。",
          },
          {
            q: "压缩会上传图片吗？",
            a: "不会。压缩在这台设备的浏览器里完成。",
          },
        ],
      },
      resize: {
        description: "在浏览器本地按指定宽高缩放图片，可以留白完整显示、铺满裁切或拉伸。图片不会上传。",
        faqs: [
          {
            q: "缩放会裁掉画面吗？",
            a: "可以选择留白完整显示、铺满并裁切，或拉伸到指定宽高。",
          },
          {
            q: "缩放会上传图片吗？",
            a: "不会。缩放在这台设备的浏览器里完成。",
          },
        ],
      },
      converter: {
        description: "在浏览器本地于 PNG、JPEG、WebP、BMP、ICO 之间转换图片。当前浏览器不能导出的格式会在页面上说明。",
        faqs: [
          {
            q: "支持哪些格式？",
            a: "可以在 PNG、JPEG、WebP、BMP、ICO 之间转换。当前浏览器无法导出的格式会直接提示，不会假装已经转换成功。",
          },
          {
            q: "转格式会上传图片吗？",
            a: "不会。转格式在这台设备的浏览器里完成。",
          },
        ],
      },
      cropping: {
        description: "在浏览器里框选、旋转或翻转后导出 PNG。图片不会上传。",
        faqs: [
          {
            q: "裁剪结果是什么格式？",
            a: "框选、旋转或翻转后导出 PNG。可以自由框选，也可以选择固定比例。",
          },
          {
            q: "裁剪会上传图片吗？",
            a: "不会。裁剪在这台设备的浏览器里完成。",
          },
        ],
      },
      "id-photo": {
        description: "按一寸、二寸、护照或美签的像素裁成证件照比例，并铺上白、蓝或红底。这里只裁切和铺底色，不抠图。",
        faqs: [
          {
            q: "这里会抠图吗？",
            a: "不会。证件照尺寸只按常见像素裁成比例并铺上白、蓝或红底。去掉背景要用抠图。",
          },
          {
            q: "有哪些尺寸？",
            a: "包含一寸 295×413、二寸 413×626、护照 413×531 和美签 600×600。",
          },
        ],
      },
      sizes: {
        description: "把图片放进 Instagram、YouTube 封面或小红书等常见尺寸。可以留白、铺满裁切或拉伸，处理在浏览器本地完成。",
        faqs: [
          {
            q: "有哪些社交尺寸？",
            a: "包含 Instagram 帖子 1080×1080、竖图 1080×1350、故事 1080×1920、YouTube 封面 1280×720 和小红书 1080×1440。",
          },
          {
            q: "画面放不进目标尺寸时会怎样？",
            a: "可以留白完整显示、铺满并裁切，或拉伸到指定尺寸。处理在浏览器本地完成。",
          },
        ],
      },
      cutting: {
        description: "按竖线、横线、斜线或宫格切开图片。除宫格外可以再拼回去。切图在浏览器本地完成。",
        faqs: [
          {
            q: "可以怎么切？",
            a: "可以按竖线、横线、斜线或宫格切开。除宫格外，切开的图片还可以再拼回去。",
          },
          {
            q: "切图会上传吗？",
            a: "不会。切图在这台设备的浏览器里完成。",
          },
        ],
      },
      watermark: {
        description: "在浏览器本地给图片加上文字水印，可调位置、字号、颜色、透明度和描边。图片不会上传。",
        faqs: [
          {
            q: "水印可以怎么放？",
            a: "文字可放在正中、四边中点、四个角，也可以随机，并可调整字号、字体、颜色、不透明度和描边。",
          },
          {
            q: "水印会上传图片吗？",
            a: "不会。水印在这台设备的浏览器里完成。",
          },
        ],
      },
      caption: {
        description: "在画面中央加上一行大字，处理在浏览器本地完成。图片不会上传。",
        faqs: [
          {
            q: "字加在哪里？",
            a: "在画面中央加上一行大字，可调整字号、字体、颜色、不透明度和描边。",
          },
          {
            q: "加字会上传图片吗？",
            a: "不会。加字在这台设备的浏览器里完成。",
          },
        ],
      },
      fade: {
        description: "在浏览器本地把图片转成灰度。图片不会上传。",
        faqs: [
          {
            q: "灰度会保留原来的颜色吗？",
            a: "不会。这个工具把整张图片转成灰度。",
          },
          {
            q: "灰度会上传图片吗？",
            a: "不会。灰度在这台设备的浏览器里完成。",
          },
        ],
      },
      tocircle: {
        description: "按直径把图片裁成圆形。直径为 0 时使用短边。处理在浏览器本地完成。",
        faqs: [
          {
            q: "圆形怎么裁？",
            a: "按直径裁成圆形。直径填 0 时使用图片短边。",
          },
          {
            q: "圆形裁切会上传图片吗？",
            a: "不会。圆形裁切在这台设备的浏览器里完成。",
          },
        ],
      },
      pdf: {
        description: "把多张图片合成 PDF，每张图片单独一页。在浏览器本地生成，不会上传。",
        faqs: [
          {
            q: "多张图片怎么排？",
            a: "每张图片单独成为 PDF 的一页，按放入顺序排列。",
          },
          {
            q: "生成 PDF 会上传图片吗？",
            a: "不会。PDF 在这台设备的浏览器里生成。",
          },
        ],
      },
      favicon: {
        description: "从一张图片导出 16、32、48、180 的 PNG 和一个 ICO。在浏览器本地生成，不会上传。",
        faqs: [
          {
            q: "会导出哪些文件？",
            a: "导出边长 16、32、48、180 的 PNG，以及一个 ICO。",
          },
          {
            q: "生成 Favicon 会上传图片吗？",
            a: "不会。Favicon 在这台设备的浏览器里生成。",
          },
        ],
      },
      exif: {
        description: "查看图片 EXIF 后，重绘成不含元数据的新图。不改原文件，也不上传。",
        faqs: [
          {
            q: "去除信息会删掉什么？",
            a: "先查看 EXIF，再重绘成一张不含元数据的新图。原文件不会被改写。",
          },
          {
            q: "和图片信息有什么不同？",
            a: "去除信息会导出新图。图片信息只查看和导出 JSON，不生成去元数据的图片。",
          },
        ],
      },
      pix: {
        description: "查看图片尺寸和 EXIF，并可导出 JSON。这里只读取信息；要去掉元数据请使用去除信息。不会上传。",
        faqs: [
          {
            q: "图片信息包含什么？",
            a: "查看尺寸和 EXIF，并可以把读到的信息导出为 JSON。",
          },
          {
            q: "这里会修改图片吗？",
            a: "不会。要得到不含元数据的新图，使用去除信息。读取在浏览器本地完成。",
          },
        ],
      },
      prompt: {
        description:
          "AI提示词提取：读取 PNG、JPEG 图片里嵌入的正向提示词、负向提示词和生成参数，可用于查找 Stable Diffusion 等写在文件中的绘图提示。在浏览器本地完成，不做模型推理。",
        faqs: [
          {
            q: "能读出哪些内容？",
            a: "读取 PNG tEXt/iTXt 和 JPEG APP1/COM 里嵌入的正向提示词、负向提示词和生成参数。文件里没有这些内容时，页面会说明没有读到。",
          },
          {
            q: "会调用绘图模型吗？",
            a: "不会。这个工具不做推理，也不上传图片。",
          },
        ],
      },
    },
  },
  ui: {
    replace: "换一张",
    replaceFiles: "重新选择",
    exportPng: "导出 PNG",
    downloadResult: "下载结果",
    again: "重新处理",
    repaint: "继续涂抹",
    remove: "移除",
    clearMask: "清除涂抹",
    startCutout: "开始抠图",
    startEnhance: "开始优化",
    startErase: "开始消除",
    brush: "画笔粗细",
    paintHint: "在要消除的区域涂抹。白色笔迹会作为蒙版交给引擎。",
    needPaint: "请先涂抹要消除的区域",
    compare: "左右拖动，对比原图和结果",
    original: "原图",
    result: "结果",
    ratio: "比例",
    ratioFree: "自由",
    rotateLeft: "向左旋转",
    rotateRight: "向右旋转",
    flipX: "水平翻转",
    flipY: "垂直翻转",
    format: "格式",
    quality: "质量",
    maxEdge: "最长边",
    maxEdgeHint: "0 为原尺寸",
    targetKb: "目标体积 KB",
    targetKbHint: "0 为不限制",
    pngNote: "PNG 按像素压缩，质量滑杆不生效。",
    width: "宽度",
    height: "高度",
    fit: "放入方式",
    fitContain: "留白完整显示",
    fitCover: "铺满并裁切",
    fitStretch: "拉伸到指定尺寸",
    targetFormat: "目标格式",
    needFormat: "请至少选择一种格式",
    cannotExport: "这些格式在当前浏览器里无法导出",
    diameter: "直径",
    diameterHint: "0 表示用短边",
    before: "处理前",
    after: "重绘后",
    noExif: "没有读到 EXIF",
    selected: "已选择",
    sheets: "张",
    buildPdf: "生成 PDF",
    exportJson: "导出 JSON",
    noPrompt: "没有读到嵌入的 AI 提示词",
    preset: "预设",
    background: "底色",
    output: "输出",
    text: "文字",
    fontSize: "字号",
    position: "位置",
    font: "字体",
    textColor: "文字颜色",
    opacity: "不透明度",
    stroke: "描边",
    needText: "请先填写文字",
    cutWay: "方式",
    cutAction: "动作",
    pieceCount: "片数",
    rowCount: "行数",
    colCount: "列数",
    gridMergeUnsupported: "宫格只支持切开，不支持自动合并。",
    model: "模型",
    effect: "效果",
    scale: "倍率",
    canvas: "无法使用画布",
    maskExport: "无法导出蒙版",
    cut: {
      vertical: "竖切",
      horizontal: "横切",
      diagonalLeft: "左斜",
      diagonalRight: "右斜",
      diagonalX: "X 形",
      grid: "宫格",
      split: "切开",
      auto: "合并",
    },
    place: {
      random: "随机",
      center: "正中",
      top: "顶部居中",
      bottom: "底部居中",
      left: "左侧居中",
      right: "右侧居中",
      topLeft: "左上",
      topRight: "右上",
      bottomLeft: "左下",
      bottomRight: "右下",
    },
    models: {
      u2net: "通用",
      u2netp: "轻量",
      human: "人像",
      isnet: "高精度",
      anime: "动漫",
    },
    effects: {
      balanced: "通用增强",
      standard: "标准增强",
      premium: "高质量增强",
      anime: "数字艺术",
      animePro: "动漫",
    },
  },
} as const;

type DeepWritable<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly DeepWritable<U>[]
    : T extends object
      ? { -readonly [K in keyof T]: DeepWritable<T[K]> }
      : T;

export type Copy = DeepWritable<typeof zh>;
export type ToolId = keyof typeof zh.tools;
