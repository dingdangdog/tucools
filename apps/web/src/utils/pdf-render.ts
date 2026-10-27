import { PDFDocument } from "pdf-lib";
import { canvasToBlob } from "./image";
import {
  exportPixelSize,
  layoutPdfPage,
  type PdfFit,
  type PdfOrientation,
  type PdfPageLayout,
  type PdfPaper,
} from "./pdf-layout";

export function rotatedSource(image: CanvasImageSource, width: number, height: number, quarterTurns: number) {
  const turns = ((quarterTurns % 4) + 4) % 4;
  if (turns === 0) return { source: image, width, height };
  const canvas = document.createElement("canvas");
  const swap = turns % 2 === 1;
  canvas.width = Math.max(1, Math.round(swap ? height : width));
  canvas.height = Math.max(1, Math.round(swap ? width : height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((turns * Math.PI) / 2);
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  return { source: canvas, width: canvas.width, height: canvas.height };
}

export function paintPdfPage(
  canvas: HTMLCanvasElement,
  source: CanvasImageSource,
  layout: PdfPageLayout,
  background: string,
  pixelWidth: number,
  pixelHeight: number,
) {
  canvas.width = Math.max(1, pixelWidth);
  canvas.height = Math.max(1, pixelHeight);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  const scaleX = canvas.width / layout.pageWidth;
  const scaleY = canvas.height / layout.pageHeight;
  ctx.drawImage(
    source,
    layout.sx,
    layout.sy,
    layout.sw,
    layout.sh,
    layout.x * scaleX,
    layout.y * scaleY,
    layout.width * scaleX,
    layout.height * scaleY,
  );
}

export async function buildImagePdf(
  pages: { source: CanvasImageSource; width: number; height: number }[],
  options: {
    paper: PdfPaper;
    orientation: PdfOrientation;
    fit: PdfFit;
    marginRatio: number;
    background: string;
  },
) {
  const pdf = await PDFDocument.create();
  for (const page of pages) {
    const layout = layoutPdfPage(page.width, page.height, options.paper, options.orientation, options.fit, options.marginRatio);
    const pixels = exportPixelSize(layout);
    const bitmap = document.createElement("canvas");
    paintPdfPage(bitmap, page.source, layout, options.background, pixels.width, pixels.height);
    const blob = await canvasToBlob(bitmap, "image/jpeg", 0.92);
    const embedded = await pdf.embedJpg(new Uint8Array(await blob.arrayBuffer()));
    const pdfPage = pdf.addPage([layout.pageWidth, layout.pageHeight]);
    pdfPage.drawImage(embedded, { x: 0, y: 0, width: layout.pageWidth, height: layout.pageHeight });
  }
  return pdf.save();
}
