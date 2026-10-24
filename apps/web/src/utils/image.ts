export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function isHeicFile(file: File) {
  const name = file.name.toLowerCase();
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

const imageExtension = /\.(png|jpe?g|jfif|webp|gif|bmp|ico|tiff?|svg|heic|heif)$/i;

export function isProcessableImage(file: File) {
  if (file.type.startsWith("image/")) return true;
  return imageExtension.test(file.name);
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number
) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("无法导出图片"));
          return;
        }
        resolve(blob);
      },
      type,
      quality
    );
  });
}

export function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("图片无法打开"));
    image.src = src;
  });
}

export async function decodeHeicToJpeg(file: File) {
  const mod = await import("heic2any");
  const heic2any = mod.default;
  const result = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.92,
  });
  return Array.isArray(result) ? result[0] : result;
}

export async function fileToImage(file: File) {
  if (isHeicFile(file)) {
    const jpeg = await decodeHeicToJpeg(file);
    const src = URL.createObjectURL(jpeg);
    try {
      return await loadImage(src);
    } finally {
      URL.revokeObjectURL(src);
    }
  }
  return loadImage(await blobToDataUrl(file));
}

export function drawContainCover(
  image: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  fit: "cover" | "contain",
  background: string
) {
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法使用画布");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  const scale =
    fit === "cover"
      ? Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight)
      : Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  ctx.drawImage(
    image,
    (targetWidth - width) / 2,
    (targetHeight - height) / 2,
    width,
    height
  );
  return canvas;
}

export function scaleToMaxEdge(
  image: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  maxEdge: number
) {
  let width = sourceWidth;
  let height = sourceHeight;
  const edge = Math.max(width, height);
  if (maxEdge > 0 && edge > maxEdge) {
    const scale = maxEdge / edge;
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法使用画布");
  ctx.drawImage(image, 0, 0, width, height);
  return canvas;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function stem(filename: string) {
  return filename.replace(/\.[^/.]+$/, "") || "image";
}
