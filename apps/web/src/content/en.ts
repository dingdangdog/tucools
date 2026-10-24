import type { Copy } from "./zh";

export const en: Copy = {
  appName: "图酷",
  tagline: "Image tools",
  language: "Language",
  allFeatures: "All features",
  aiGroup: "AI",
  localGroup: "Standard",
  infoGroup: "Info",
  openNav: "Tools",
  closeNav: "Close",
  themeToDark: "Switch to dark",
  themeToLight: "Switch to light",
  empty: "Drop images here, or choose files",
  choose: "Choose files",
  processing: "Processing",
  download: "Download",
  downloadAll: "Download zip",
  clear: "Clear",
  saveAs: "Save to…",
  failed: "Processing failed",
  noImage: "Please add an image file",
  engineDown: "The engine is not responding. Start the local engine or the engine in Docker.",
  engineMissing: "These files are still missing",
  modelPackHint: "Download the model pack separately, extract it into this folder, then check again:",
  refreshHealth: "Check again",
  modelChecking: "Checking models",
  modelBlocked: "No model is available, so this feature is turned off.",
  modelUnavailable: "This feature is unavailable for now",
  modelLinksLead: "Model packs and new client releases are published in the 图酷 repository.",
  modelRepo: "Repository",
  modelReleases: "Releases",
  modelPartial: "Some models are not installed yet",
  featureReady: "This feature is available.",
  currentDevice: "This device",
  menus: {
    title: "Feature menu",
    open: "Feature menu",
    lead: "Choose which tools to show on this device. The choice is saved on this device.",
    capped: "This deployment only offers the tools below. What you check is saved on this device.",
    browserLead:
      "A browser deployment uses the TUCOOLS_FEATURES environment variable to decide which tools are shown. Separate feature names with commas. If it is unset, every tool is shown.",
    browserCurrent: "Currently shown",
    showAll: "Show every allowed feature",
    empty: "No tools can be shown right now.",
  },
  homeLead:
    "Standard and info tools run in the browser on this device. Cutout, enhance, and erase use the same engine. The installer and Docker use the same page.",
  tools: {
    home: { title: "Start", lead: "Choose a tool on the left." },
    compress: { title: "Compress", lead: "Compress JPEG, PNG, or WebP by quality, longest edge, or target size." },
    resize: { title: "Resize", lead: "Scale to a given width and height, or place the image on a canvas with margins." },
    converter: { title: "Convert", lead: "Convert between PNG, JPEG, WebP, BMP, and ICO." },
    cropping: { title: "Crop", lead: "Select an area, rotate, then export PNG." },
    idPhoto: {
      title: "ID photo size",
      lead: "Crop to common ID-photo pixel sizes and fill a background color. This does not remove the background.",
    },
    sizes: { title: "Social sizes", lead: "Place the image into common social-platform sizes." },
    store: {
      title: "Store sizes",
      lead: "Place one image into common App Store, Google Play, and Chrome Web Store sizes. Fit with margins, fill and crop, stretch, or tile.",
    },
    cutting: {
      title: "Split",
      lead: "Split on a vertical, horizontal, or diagonal line, or into a grid. The pieces can also be joined back.",
    },
    watermark: { title: "Watermark", lead: "Add a text watermark to the image." },
    caption: { title: "Add text", lead: "Add one large line of text in the center." },
    fade: { title: "Grayscale", lead: "Convert the image to grayscale." },
    tocircle: { title: "Circle", lead: "Crop to a circle by diameter." },
    exif: { title: "Strip info", lead: "View the EXIF, then redraw a new image without metadata." },
    pdf: { title: "To PDF", lead: "Put each image on its own page and export a PDF." },
    favicon: { title: "Favicon", lead: "Export PNGs at 16, 32, 48, and 180, plus one ICO." },
    prompt: {
      title: "Prompt extract",
      lead: "Read the embedded AI prompt, negative prompt, and generation parameters from PNG and JPEG files.",
    },
    pix: { title: "Image info", lead: "View the EXIF and export JSON." },
    cutout: { title: "Cutout", lead: "Remove the background and export a transparent PNG." },
    enhance: { title: "Enhance", lead: "Upscale and enhance the image with the selected effect." },
    erase: { title: "Erase", lead: "Paint the area to remove, then let the engine fill it in." },
  },
  seo: {
    faqHeading: "Common questions",
    listName: "图酷 image tools",
    boundary:
      "Standard and info tools run locally in the browser. Cutout, enhance, and erase request only the same-origin /api/engine, not a third party. The model pack is downloaded separately and is not included in the installer or the Docker image. ID photo size only crops and fills a background. Prompt extract only reads text already in the file and does not run a model.",
    omitHeading: "Not cited as a tool description",
    missingTitle: "Page not found",
    missingBody: "This address does not match a tool.",
    backHome: "Back to start",
    homeDescription:
      "图酷 gives compress, resize, convert, crop, ID photo size, social sizes, store sizes, split, watermark, add text, grayscale, circle, image to PDF, Favicon, strip info, image info, and prompt extract their own addresses, and processes them locally in the browser. Cutout, enhance, and erase request only the same-origin engine.",
    homeFaqs: [
      {
        q: "Are images uploaded to a server?",
        a: "Standard and info tools run in the browser on this device, and the image is not uploaded. Cutout, enhance, and erase request only this site's /api/engine, not a third party.",
      },
      {
        q: "Do the installer and the website use the same tools?",
        a: "Yes. Docker and the Windows installer use the same page. The model pack is downloaded separately and is not included in the installer or the Docker image.",
      },
    ],
    tools: {
      cutout: {
        description:
          "Remove the background and export a transparent PNG. The request goes only to this site's engine, not to a third party. You cannot start when no model is available.",
        faqs: [
          {
            q: "What does cutout produce?",
            a: "It removes the background and exports a transparent PNG. The page lists only models that are installed and ready.",
          },
          {
            q: "Is the image sent to a third party?",
            a: "No. The request goes only to this site's /api/engine. The upload limit is 50MB, and the engine handles one task at a time. You cannot start when no model is available.",
          },
        ],
      },
      enhance: {
        description:
          "Upscale and enhance the image with an installed effect. The request goes only to this site's engine. You cannot start when no model is available.",
        faqs: [
          {
            q: "What does enhance do?",
            a: "It upscales and enhances the image with the selected effect. The page lists only effects that are installed and ready.",
          },
          {
            q: "Is the image sent to a third party?",
            a: "No. The request goes only to this site's /api/engine. You cannot start when no model is available. A Linux container also needs the upscayl-bin from the model pack.",
          },
        ],
      },
      erase: {
        description:
          "Paint the area to remove and let this site's engine fill it in. You cannot start when no model is available, and the image is not sent to a third party.",
        faqs: [
          {
            q: "How do I mark the area to erase?",
            a: "Paint on the image. White strokes are sent to the engine as a mask to fill. You can clear them and paint again.",
          },
          {
            q: "Is the image sent to a third party?",
            a: "No. The request goes only to this site's /api/engine. The upload limit is 50MB. You cannot start when no model is available.",
          },
        ],
      },
      compress: {
        description:
          "Compress JPEG, PNG, and WebP locally in the browser by quality, longest edge, or target size. The image is not uploaded.",
        faqs: [
          {
            q: "Can I compress to a set size?",
            a: "You can compress JPEG, PNG, and WebP by quality, longest edge, or target size. A target size of 0 means no limit. PNG is compressed by pixels, so the quality slider has no effect.",
          },
          {
            q: "Does compression upload the image?",
            a: "No. Compression runs in the browser on this device.",
          },
        ],
      },
      resize: {
        description:
          "Scale an image to a given width and height locally in the browser. You can fit it with margins, fill and crop, or stretch. The image is not uploaded.",
        faqs: [
          {
            q: "Does resizing crop the image?",
            a: "You can fit the whole image with margins, fill and crop, or stretch to the given width and height.",
          },
          {
            q: "Does resizing upload the image?",
            a: "No. Resizing runs in the browser on this device.",
          },
        ],
      },
      converter: {
        description:
          "Convert images between PNG, JPEG, WebP, BMP, and ICO locally in the browser. Formats this browser cannot export are explained on the page.",
        faqs: [
          {
            q: "Which formats are supported?",
            a: "You can convert between PNG, JPEG, WebP, BMP, and ICO. If this browser cannot export a format, the page says so instead of pretending the conversion succeeded.",
          },
          {
            q: "Does conversion upload the image?",
            a: "No. Conversion runs in the browser on this device.",
          },
        ],
      },
      cropping: {
        description: "Select an area, rotate, or flip in the browser, then export PNG. The image is not uploaded.",
        faqs: [
          {
            q: "What format does the crop use?",
            a: "After you select an area, rotate, or flip, it exports PNG. You can select freely or use a fixed ratio.",
          },
          {
            q: "Does cropping upload the image?",
            a: "No. Cropping runs in the browser on this device.",
          },
        ],
      },
      "id-photo": {
        description:
          "Crop to the pixel size for a 1-inch, 2-inch, passport, or US-visa photo, and fill a white, blue, or red background. This only crops and fills the background. It does not remove the background.",
        faqs: [
          {
            q: "Does this remove the background?",
            a: "No. ID photo size only crops to a common pixel size and fills a white, blue, or red background. To remove the background, use Cutout.",
          },
          {
            q: "Which sizes are included?",
            a: "1-inch 295×413, 2-inch 413×626, passport 413×531, and US visa 600×600.",
          },
        ],
      },
      sizes: {
        description:
          "Place an image into common sizes for Instagram, a YouTube cover, or Xiaohongshu. You can fit with margins, fill and crop, or stretch. Processing runs locally in the browser.",
        faqs: [
          {
            q: "Which social sizes are included?",
            a: "Instagram post 1080×1080, portrait 1080×1350, story 1080×1920, YouTube cover 1280×720, and Xiaohongshu 1080×1440.",
          },
          {
            q: "What if the image does not fit the target size?",
            a: "You can fit the whole image with margins, fill and crop, or stretch to the given size. Processing runs locally in the browser.",
          },
        ],
      },
      store: {
        description:
          "Place one image into common App Store, Google Play, and Chrome Web Store sizes. Fit with margins, fill and crop, stretch, or tile, then download or copy the results. Processing runs locally in the browser.",
        faqs: [
          {
            q: "Which store sizes are included?",
            a: "iPhone Dynamic Island medium 1206×2622 and large 1320×2868, iPad 13-inch 2064×2752, Mac 2880×1800, iPhone Duo outer 1398×2034 and inner 2007×2853, Google Play icon 512×512, feature graphic 1024×500, phone screenshot 1080×1920, plus the Chrome Web Store icon 128×128 and screenshot 1280×800. Other accepted sizes for these stores can also be selected.",
          },
          {
            q: "How is the image placed into those sizes?",
            a: "Fit the whole image with margins, fill and crop, stretch to the size, or tile at the original pixel size. Portrait and landscape apply only to screenshots that can be swapped. Icons, Mac, and fixed promo graphics keep the size the store requires. Processing runs locally in the browser, and the results can be downloaded or copied.",
          },
        ],
      },
      cutting: {
        description:
          "Split an image on a vertical, horizontal, or diagonal line, or into a grid. Except for a grid, the pieces can be joined back. Splitting runs locally in the browser.",
        faqs: [
          {
            q: "How can I split an image?",
            a: "You can split on a vertical line, a horizontal line, a diagonal line, or a grid. Except for a grid, the pieces can be joined back together.",
          },
          {
            q: "Does splitting upload the image?",
            a: "No. Splitting runs in the browser on this device.",
          },
        ],
      },
      watermark: {
        description:
          "Add a text watermark locally in the browser. You can set the position, size, color, opacity, and stroke. The image is not uploaded.",
        faqs: [
          {
            q: "Where can the watermark go?",
            a: "Text can sit in the center, at the midpoint of an edge, in a corner, or at random. You can change the size, font, color, opacity, and stroke.",
          },
          {
            q: "Does the watermark upload the image?",
            a: "No. The watermark runs in the browser on this device.",
          },
        ],
      },
      caption: {
        description: "Add one large line of text in the center. Processing runs locally in the browser. The image is not uploaded.",
        faqs: [
          {
            q: "Where is the text placed?",
            a: "One large line is placed in the center. You can change the size, font, color, opacity, and stroke.",
          },
          {
            q: "Does adding text upload the image?",
            a: "No. Adding text runs in the browser on this device.",
          },
        ],
      },
      fade: {
        description: "Convert an image to grayscale locally in the browser. The image is not uploaded.",
        faqs: [
          {
            q: "Does grayscale keep the original colors?",
            a: "No. This tool converts the whole image to grayscale.",
          },
          {
            q: "Does grayscale upload the image?",
            a: "No. Grayscale runs in the browser on this device.",
          },
        ],
      },
      tocircle: {
        description: "Crop an image to a circle by diameter. A diameter of 0 uses the shorter side. Processing runs locally in the browser.",
        faqs: [
          {
            q: "How is the circle cropped?",
            a: "It crops to a circle by diameter. A diameter of 0 uses the shorter side of the image.",
          },
          {
            q: "Does the circle crop upload the image?",
            a: "No. The circle crop runs in the browser on this device.",
          },
        ],
      },
      pdf: {
        description: "Combine images into a PDF, with one image on each page. The PDF is created locally in the browser and is not uploaded.",
        faqs: [
          {
            q: "How are several images arranged?",
            a: "Each image becomes its own PDF page, in the order you added them.",
          },
          {
            q: "Does creating a PDF upload the images?",
            a: "No. The PDF is created in the browser on this device.",
          },
        ],
      },
      favicon: {
        description:
          "Export PNGs at 16, 32, 48, and 180, plus one ICO, from one image. They are created locally in the browser and are not uploaded.",
        faqs: [
          {
            q: "Which files are exported?",
            a: "PNGs with sides of 16, 32, 48, and 180, plus one ICO.",
          },
          {
            q: "Does creating a Favicon upload the image?",
            a: "No. The Favicon is created in the browser on this device.",
          },
        ],
      },
      exif: {
        description: "View an image's EXIF, then redraw a new image without metadata. The original file is left unchanged, and nothing is uploaded.",
        faqs: [
          {
            q: "What does strip info remove?",
            a: "It shows the EXIF, then redraws a new image without metadata. The original file is not overwritten.",
          },
          {
            q: "How is this different from image info?",
            a: "Strip info exports a new image. Image info only views the data and exports JSON. It does not create an image without metadata.",
          },
        ],
      },
      pix: {
        description:
          "View an image's size and EXIF, and export JSON. This only reads the information. To remove metadata, use Strip info. Nothing is uploaded.",
        faqs: [
          {
            q: "What does image info include?",
            a: "It shows the size and EXIF, and can export what it read as JSON.",
          },
          {
            q: "Does this change the image?",
            a: "No. To get a new image without metadata, use Strip info. Reading runs locally in the browser.",
          },
        ],
      },
      prompt: {
        description:
          "Prompt extract: read the positive prompt, negative prompt, and generation parameters embedded in PNG and JPEG images, including drawing prompts that Stable Diffusion and similar tools write into the file. This runs locally in the browser and does not run a model.",
        faqs: [
          {
            q: "What can it read?",
            a: "It reads the positive prompt, negative prompt, and generation parameters embedded in PNG tEXt/iTXt and JPEG APP1/COM. If the file has none of these, the page says nothing was found.",
          },
          {
            q: "Does it call a drawing model?",
            a: "No. This tool does not run a model, and it does not upload the image.",
          },
        ],
      },
    },
  },
  ui: {
    replace: "Replace",
    replaceFiles: "Choose again",
    exportPng: "Export PNG",
    downloadResult: "Download result",
    again: "Process again",
    repaint: "Keep painting",
    remove: "Remove",
    clearMask: "Clear paint",
    startCutout: "Start cutout",
    startEnhance: "Start enhance",
    startErase: "Start erase",
    brush: "Brush size",
    paintHint: "Paint the area to erase. White strokes are sent to the engine as a mask.",
    needPaint: "Paint the area to erase first",
    compare: "Drag left or right to compare the original and the result",
    original: "Original",
    result: "Result",
    ratio: "Ratio",
    ratioFree: "Free",
    rotateLeft: "Rotate left",
    rotateRight: "Rotate right",
    flipX: "Flip horizontal",
    flipY: "Flip vertical",
    format: "Format",
    quality: "Quality",
    maxEdge: "Longest edge",
    maxEdgeHint: "0 keeps the original size",
    targetKb: "Target size KB",
    targetKbHint: "0 means no limit",
    pngNote: "PNG is compressed by pixels, so the quality slider has no effect.",
    width: "Width",
    height: "Height",
    fit: "Fit",
    fitContain: "Fit with margins",
    fitCover: "Fill and crop",
    fitStretch: "Stretch to size",
    fitTile: "Tile",
    copyImage: "Copy",
    copied: "Copied",
    copyFailed: "Could not copy to the clipboard",
    targetFormat: "Target format",
    needFormat: "Choose at least one format",
    cannotExport: "This browser cannot export these formats",
    diameter: "Diameter",
    diameterHint: "0 uses the shorter side",
    before: "Before",
    after: "Redrawn",
    noExif: "No EXIF found",
    selected: "Selected",
    sheets: "images",
    buildPdf: "Create PDF",
    exportJson: "Export JSON",
    noPrompt: "No embedded AI prompt found",
    preset: "Preset",
    background: "Background",
    output: "Output",
    text: "Text",
    fontSize: "Font size",
    position: "Position",
    font: "Font",
    textColor: "Text color",
    opacity: "Opacity",
    stroke: "Stroke",
    needText: "Enter text first",
    cutWay: "Method",
    cutAction: "Action",
    pieceCount: "Pieces",
    rowCount: "Rows",
    colCount: "Columns",
    gridMergeUnsupported: "A grid can only be split. It is not merged automatically.",
    model: "Model",
    effect: "Effect",
    scale: "Scale",
    canvas: "Canvas unavailable",
    maskExport: "Could not export the mask",
    store: {
      platform: "Platform",
      size: "Size",
      orientation: "Orientation",
      portrait: "Portrait",
      landscape: "Landscape",
      both: "Portrait and landscape",
      orientationHint: "Orientation applies only to screenshots that can be swapped. Icons, Mac, and fixed promo graphics keep the size the store requires.",
      recommended: "Common in this group",
      selectAll: "Select this group",
      clearGroup: "Clear this group",
      generate: "Generate again",
      needSize: "Choose at least one size",
      alphaNote: "App Store screenshots and the Google Play feature graphic cannot include transparency. JPEG fills a transparent background with white.",
      tileHint: "Tile repeats the image at its original pixel size. If the image is larger than the target, only the top-left area is visible.",
      transparent: "Transparent",
      white: "White",
      black: "Black",
      custom: "Custom",
      groups: {
        iphone: "iPhone",
        ipad: "iPad",
        mac: "Mac",
        duo: "iPhone Duo",
        play: "Google Play",
        chrome: "Chrome extension",
      },
      names: {
        "iphone-1206x2622": "Dynamic Island, medium",
        "iphone-1179x2556": "Dynamic Island, medium",
        "iphone-1320x2868": "Dynamic Island, large",
        "iphone-1290x2796": "Dynamic Island, large",
        "iphone-1260x2736": "Dynamic Island, large",
        "iphone-1284x2778": "Face ID, large",
        "iphone-1242x2688": "Face ID, large",
        "iphone-1170x2532": "Face ID, medium",
        "iphone-1242x2208": "Home button, large",
        "ipad-2064x2752": "iPad 13-inch",
        "ipad-2048x2732": "iPad 13-inch",
        "ipad-1668x2420": "iPad 11-inch",
        "ipad-1488x2266": "iPad 11-inch",
        "mac-2880x1800": "Mac",
        "mac-2560x1600": "Mac",
        "mac-1440x900": "Mac",
        "mac-1280x800": "Mac",
        "duo-1398x2034": "iPhone Duo, outer",
        "duo-2007x2853": "iPhone Duo, inner",
        "apple-1024": "App Store icon",
        "play-512": "Icon",
        "play-1024x500": "Feature graphic",
        "play-1080x1920": "Phone screenshot",
        "play-1440x2560": "Tablet 9:16",
        "play-1280x720": "TV banner",
        "play-384": "Wear OS",
        "chrome-128": "Store icon",
        "chrome-1280x800": "Screenshot",
        "chrome-640x400": "Screenshot",
        "chrome-440x280": "Small promo tile",
        "chrome-1400x560": "Marquee promo tile",
      },
    },
    cut: {
      vertical: "Vertical",
      horizontal: "Horizontal",
      diagonalLeft: "Left diagonal",
      diagonalRight: "Right diagonal",
      diagonalX: "X",
      grid: "Grid",
      split: "Split",
      auto: "Merge",
    },
    place: {
      random: "Random",
      center: "Center",
      top: "Top center",
      bottom: "Bottom center",
      left: "Left center",
      right: "Right center",
      topLeft: "Top left",
      topRight: "Top right",
      bottomLeft: "Bottom left",
      bottomRight: "Bottom right",
    },
    models: {
      u2net: "General",
      u2netp: "Light",
      human: "Portrait",
      isnet: "High precision",
      anime: "Anime",
    },
    effects: {
      balanced: "General enhance",
      standard: "Standard enhance",
      premium: "High-quality enhance",
      anime: "Digital art",
      animePro: "Anime",
    },
  },
};
