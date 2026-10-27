export type PdfPaper = "original" | "a4" | "a3" | "a5" | "letter";
export type PdfOrientation = "auto" | "portrait" | "landscape";
export type PdfFit = "contain" | "cover" | "stretch";

export type PdfPageLayout = {
  pageWidth: number;
  pageHeight: number;
  x: number;
  y: number;
  width: number;
  height: number;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
};

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;

const FIXED_PAPERS: Record<Exclude<PdfPaper, "original">, { width: number; height: number }> = {
  a4: { width: A4_WIDTH, height: A4_HEIGHT },
  a3: { width: A4_HEIGHT, height: 1190.55 },
  a5: { width: 419.53, height: A4_WIDTH },
  letter: { width: 612, height: 792 },
};

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function applyOrientation(
  width: number,
  height: number,
  imageWidth: number,
  imageHeight: number,
  orientation: PdfOrientation,
) {
  const pageIsPortrait = height >= width;
  const wantPortrait =
    orientation === "portrait" ? true : orientation === "landscape" ? false : imageHeight >= imageWidth;
  if (wantPortrait === pageIsPortrait) return { width, height };
  return { width: height, height: width };
}

function resolvePage(imageWidth: number, imageHeight: number, paper: PdfPaper, orientation: PdfOrientation) {
  if (paper === "original") {
    const long = A4_HEIGHT;
    const short = (long * Math.min(imageWidth, imageHeight)) / Math.max(imageWidth, imageHeight);
    const width = imageWidth >= imageHeight ? long : short;
    const height = imageWidth >= imageHeight ? short : long;
    return applyOrientation(width, height, imageWidth, imageHeight, orientation);
  }
  const base = FIXED_PAPERS[paper];
  return applyOrientation(base.width, base.height, imageWidth, imageHeight, orientation);
}

export function layoutPdfPage(
  imageWidth: number,
  imageHeight: number,
  paper: PdfPaper,
  orientation: PdfOrientation,
  fit: PdfFit,
  marginRatio: number,
): PdfPageLayout {
  const imageW = Math.max(1, imageWidth);
  const imageH = Math.max(1, imageHeight);
  const page = resolvePage(imageW, imageH, paper, orientation);
  const inset = Math.min(page.width, page.height) * clamp(marginRatio, 0, 0.2);
  const innerW = Math.max(1, page.width - inset * 2);
  const innerH = Math.max(1, page.height - inset * 2);

  if (fit === "stretch") {
    return {
      pageWidth: page.width,
      pageHeight: page.height,
      x: inset,
      y: inset,
      width: innerW,
      height: innerH,
      sx: 0,
      sy: 0,
      sw: imageW,
      sh: imageH,
    };
  }

  const scale =
    fit === "cover" ? Math.max(innerW / imageW, innerH / imageH) : Math.min(innerW / imageW, innerH / imageH);

  if (fit === "cover") {
    const sw = innerW / scale;
    const sh = innerH / scale;
    return {
      pageWidth: page.width,
      pageHeight: page.height,
      x: inset,
      y: inset,
      width: innerW,
      height: innerH,
      sx: (imageW - sw) / 2,
      sy: (imageH - sh) / 2,
      sw,
      sh,
    };
  }

  const width = imageW * scale;
  const height = imageH * scale;
  return {
    pageWidth: page.width,
    pageHeight: page.height,
    x: (page.width - width) / 2,
    y: (page.height - height) / 2,
    width,
    height,
    sx: 0,
    sy: 0,
    sw: imageW,
    sh: imageH,
  };
}

export function pointsToMm(points: number) {
  return Math.round((points * 25.4) / 72);
}

export function exportPixelSize(layout: Pick<PdfPageLayout, "pageWidth" | "pageHeight">) {
  const maxEdge = 4096;
  let width = (layout.pageWidth * 150) / 72;
  let height = (layout.pageHeight * 150) / 72;
  const edge = Math.max(width, height);
  if (edge > maxEdge) {
    const fit = maxEdge / edge;
    width *= fit;
    height *= fit;
  }
  return {
    width: Math.max(1, Math.round(width)),
    height: Math.max(1, Math.round(height)),
  };
}
