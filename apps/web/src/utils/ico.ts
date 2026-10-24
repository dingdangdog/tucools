export interface IcoImage {
  png: Uint8Array;
  width: number;
  height: number;
}

export function encodeIco(images: IcoImage[]) {
  const count = images.length;
  const headerSize = 6 + count * 16;
  const header = new Uint8Array(headerSize);
  const view = new DataView(header.buffer);
  view.setUint16(2, 1, true);
  view.setUint16(4, count, true);
  let offset = headerSize;
  images.forEach((image, index) => {
    const entry = 6 + index * 16;
    header[entry] = image.width >= 256 ? 0 : image.width;
    header[entry + 1] = image.height >= 256 ? 0 : image.height;
    view.setUint16(entry + 4, 1, true);
    view.setUint16(entry + 6, 32, true);
    view.setUint32(entry + 8, image.png.byteLength, true);
    view.setUint32(entry + 12, offset, true);
    offset += image.png.byteLength;
  });
  const output = new Uint8Array(offset);
  output.set(header, 0);
  let cursor = headerSize;
  for (const image of images) {
    output.set(image.png, cursor);
    cursor += image.png.byteLength;
  }
  return output;
}

export async function canvasToPngBytes(canvas: HTMLCanvasElement) {
  const { canvasToBlob } = await import("./image");
  const blob = await canvasToBlob(canvas, "image/png");
  return new Uint8Array(await blob.arrayBuffer());
}

export async function canvasToIcoBlob(source: HTMLCanvasElement) {
  const sizes = [16, 32, 48, 256];
  const images: IcoImage[] = [];
  for (const size of sizes) {
    const { drawContainCover } = await import("./image");
    const canvas = drawContainCover(
      source,
      source.width,
      source.height,
      size,
      size,
      "cover",
      "rgba(0,0,0,0)"
    );
    images.push({
      png: await canvasToPngBytes(canvas),
      width: size,
      height: size,
    });
  }
  return new Blob([encodeIco(images)], { type: "image/x-icon" });
}
