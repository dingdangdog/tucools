export type CutMode =
  | "vertical"
  | "horizontal"
  | "diagonal-left"
  | "diagonal-right"
  | "diagonal-x";

type Point = [number, number];
type CanvasSource = HTMLCanvasElement | HTMLImageElement;

const EPS = 1e-6;

const dot2 = (a: Point, b: Point) => a[0] * b[0] + a[1] * b[1];

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

const getWidth = (src: CanvasSource) =>
  src instanceof HTMLImageElement ? src.naturalWidth : src.width;

const getHeight = (src: CanvasSource) =>
  src instanceof HTMLImageElement ? src.naturalHeight : src.height;

const clipPolygonHalfPlane = (
  poly: Point[],
  n: Point,
  k: number,
  keep: "ge" | "le"
): Point[] => {
  if (poly.length === 0) return [];
  const inside = (p: Point) => {
    const v = dot2(n, p) - k;
    return keep === "ge" ? v >= -EPS : v <= EPS;
  };
  const intersect = (a: Point, b: Point): Point => {
    const da = dot2(n, a);
    const db = dot2(n, b);
    const denom = db - da;
    if (Math.abs(denom) < EPS) return b;
    const t = clamp01((k - da) / denom);
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  };

  const out: Point[] = [];
  for (let i = 0; i < poly.length; i++) {
    const curr = poly[i];
    const prev = poly[(i - 1 + poly.length) % poly.length];
    const currIn = inside(curr);
    const prevIn = inside(prev);

    if (currIn) {
      if (!prevIn) out.push(intersect(prev, curr));
      out.push(curr);
    } else if (prevIn) {
      out.push(intersect(prev, curr));
    }
  }
  return out;
};

const clipRectangleByBand = (
  width: number,
  height: number,
  n: Point,
  minK: number,
  maxK: number
): Point[] => {
  let poly: Point[] = [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
  ];

  const bandPad = 1e-4 * Math.max(width, height);
  poly = clipPolygonHalfPlane(poly, n, minK - bandPad, "ge");
  poly = clipPolygonHalfPlane(poly, n, maxK + bandPad, "le");
  return poly;
};

const getXTriangles = (width: number, height: number) => {
  const centerX = width / 2;
  const centerY = height / 2;
  return [
    { name: "top_left", points: [[centerX, centerY], [0, 0], [width, 0]] as Point[] },
    { name: "top_right", points: [[centerX, centerY], [width, 0], [width, height]] as Point[] },
    { name: "bottom_right", points: [[centerX, centerY], [width, height], [0, height]] as Point[] },
    { name: "bottom_left", points: [[centerX, centerY], [0, height], [0, 0]] as Point[] },
  ];
};

/** 将单张图片按指定方式分割，返回各碎片的 canvas */
export function splitImage(
  img: HTMLImageElement,
  mode: CutMode,
  pieces: number
): HTMLCanvasElement[] {
  const width = img.naturalWidth;
  const height = img.naturalHeight;
  const results: HTMLCanvasElement[] = [];
  const pieceCount = mode === "diagonal-x" ? 4 : pieces;

  if (mode === "vertical") {
    const pieceWidth = width / pieces;
    for (let i = 0; i < pieces; i++) {
      const canvas = document.createElement("canvas");
      canvas.width = pieceWidth;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      ctx.drawImage(img, i * pieceWidth, 0, pieceWidth, height, 0, 0, pieceWidth, height);
      results.push(canvas);
    }
  } else if (mode === "horizontal") {
    const pieceHeight = height / pieces;
    for (let i = 0; i < pieces; i++) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = pieceHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      ctx.drawImage(img, 0, i * pieceHeight, width, pieceHeight, 0, 0, width, pieceHeight);
      results.push(canvas);
    }
  } else if (mode === "diagonal-left") {
    const diagonalLength = Math.sqrt(width * width + height * height);
    const angle = Math.atan2(height, width);
    const n: Point = [Math.cos(angle), Math.sin(angle)];

    for (let i = 0; i < pieces; i++) {
      const startK = (i / pieces) * diagonalLength;
      const endK = ((i + 1) / pieces) * diagonalLength;
      const polygonPoints = clipRectangleByBand(width, height, n, startK, endK);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;

      ctx.save();
      ctx.beginPath();
      if (polygonPoints.length >= 3) {
        ctx.moveTo(polygonPoints[0][0], polygonPoints[0][1]);
        for (let j = 1; j < polygonPoints.length; j++) {
          ctx.lineTo(polygonPoints[j][0], polygonPoints[j][1]);
        }
        ctx.closePath();
        ctx.clip();
      } else {
        ctx.rect(0, 0, width, height);
        ctx.clip();
      }
      ctx.drawImage(img, 0, 0, width, height);
      ctx.restore();
      results.push(canvas);
    }
  } else if (mode === "diagonal-right") {
    const diagonalLength = Math.sqrt(width * width + height * height);
    const angle = Math.atan2(height, -width);
    const n: Point = [Math.cos(angle), Math.sin(angle)];
    const offsetK = dot2(n, [width, 0]);

    for (let i = 0; i < pieces; i++) {
      const startK = offsetK + (i / pieces) * diagonalLength;
      const endK = offsetK + ((i + 1) / pieces) * diagonalLength;
      const polygonPoints = clipRectangleByBand(width, height, n, startK, endK);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;

      ctx.save();
      ctx.beginPath();
      if (polygonPoints.length >= 3) {
        ctx.moveTo(polygonPoints[0][0], polygonPoints[0][1]);
        for (let j = 1; j < polygonPoints.length; j++) {
          ctx.lineTo(polygonPoints[j][0], polygonPoints[j][1]);
        }
        ctx.closePath();
        ctx.clip();
      } else {
        ctx.rect(0, 0, width, height);
        ctx.clip();
      }
      ctx.drawImage(img, 0, 0, width, height);
      ctx.restore();
      results.push(canvas);
    }
  } else if (mode === "diagonal-x") {
    const triangles = getXTriangles(width, height);
    for (const triangle of triangles) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(triangle.points[0][0], triangle.points[0][1]);
      ctx.lineTo(triangle.points[1][0], triangle.points[1][1]);
      ctx.lineTo(triangle.points[2][0], triangle.points[2][1]);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 0, 0, width, height);
      ctx.restore();
      results.push(canvas);
    }
  }

  if (results.length !== pieceCount) {
    throw new Error(`Expected ${pieceCount} pieces, got ${results.length}`);
  }
  return results;
}

/** 按轮询规则选取碎片：第 i 个输出碎片来自第 (i % 图片数) 张图的第 i 个碎片 */
export function interleavePieces(
  piecesByImage: HTMLCanvasElement[][]
): HTMLCanvasElement[] {
  const numImages = piecesByImage.length;
  if (numImages === 0) return [];

  const numPieces = piecesByImage[0].length;
  const result: HTMLCanvasElement[] = [];

  for (let i = 0; i < numPieces; i++) {
    const imageIndex = i % numImages;
    const piece = piecesByImage[imageIndex][i];
    if (!piece) {
      throw new Error(`Missing piece ${i + 1} from image ${imageIndex + 1}`);
    }
    result.push(piece);
  }
  return result;
}

const mergeVertical = (images: CanvasSource[]): HTMLCanvasElement => {
  const totalWidth = images.reduce((sum, img) => sum + getWidth(img), 0);
  const maxHeight = Math.max(...images.map((img) => getHeight(img)));

  const canvas = document.createElement("canvas");
  canvas.width = totalWidth;
  canvas.height = maxHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  let x = 0;
  for (const img of images) {
    ctx.drawImage(img, x, 0);
    x += getWidth(img);
  }
  return canvas;
};

const mergeHorizontal = (images: CanvasSource[]): HTMLCanvasElement => {
  const maxWidth = Math.max(...images.map((img) => getWidth(img)));
  const totalHeight = images.reduce((sum, img) => sum + getHeight(img), 0);

  const canvas = document.createElement("canvas");
  canvas.width = maxWidth;
  canvas.height = totalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  let y = 0;
  for (const img of images) {
    ctx.drawImage(img, 0, y);
    y += getHeight(img);
  }
  return canvas;
};

const mergeDiagonalLeft = (images: CanvasSource[]): HTMLCanvasElement => {
  const width = getWidth(images[0]);
  const height = getHeight(images[0]);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  const diagonalLength = Math.sqrt(width * width + height * height);
  const angle = Math.atan2(height, width);
  const n: Point = [Math.cos(angle), Math.sin(angle)];

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const startK = (i / images.length) * diagonalLength;
    const endK = ((i + 1) / images.length) * diagonalLength;
    const polygonPoints = clipRectangleByBand(width, height, n, startK, endK);

    ctx.save();
    ctx.beginPath();
    if (polygonPoints.length >= 3) {
      ctx.moveTo(polygonPoints[0][0], polygonPoints[0][1]);
      for (let j = 1; j < polygonPoints.length; j++) {
        ctx.lineTo(polygonPoints[j][0], polygonPoints[j][1]);
      }
      ctx.closePath();
      ctx.clip();
    }
    ctx.drawImage(img, 0, 0, width, height);
    ctx.restore();
  }
  return canvas;
};

const mergeDiagonalRight = (images: CanvasSource[]): HTMLCanvasElement => {
  const width = getWidth(images[0]);
  const height = getHeight(images[0]);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  const diagonalLength = Math.sqrt(width * width + height * height);
  const angle = Math.atan2(height, -width);
  const n: Point = [Math.cos(angle), Math.sin(angle)];
  const offsetK = dot2(n, [width, 0]);

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const startK = offsetK + (i / images.length) * diagonalLength;
    const endK = offsetK + ((i + 1) / images.length) * diagonalLength;
    const polygonPoints = clipRectangleByBand(width, height, n, startK, endK);

    ctx.save();
    ctx.beginPath();
    if (polygonPoints.length >= 3) {
      ctx.moveTo(polygonPoints[0][0], polygonPoints[0][1]);
      for (let j = 1; j < polygonPoints.length; j++) {
        ctx.lineTo(polygonPoints[j][0], polygonPoints[j][1]);
      }
      ctx.closePath();
      ctx.clip();
    }
    ctx.drawImage(img, 0, 0, width, height);
    ctx.restore();
  }
  return canvas;
};

const mergeDiagonalX = (images: CanvasSource[]): HTMLCanvasElement => {
  if (images.length !== 4) {
    throw new Error("X型合并需要4张碎片");
  }

  const width = getWidth(images[0]);
  const height = getHeight(images[0]);
  const triangles = getXTriangles(width, height);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const points = triangles[i].points;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    ctx.lineTo(points[1][0], points[1][1]);
    ctx.lineTo(points[2][0], points[2][1]);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, 0, 0, width, height);
    ctx.restore();
  }
  return canvas;
};

/** 将多个碎片按指定方式合并为一张图 */
export function mergePieces(
  images: CanvasSource[],
  mode: CutMode
): HTMLCanvasElement {
  if (images.length === 0) {
    throw new Error("No pieces to merge");
  }

  if (mode === "vertical") return mergeVertical(images);
  if (mode === "horizontal") return mergeHorizontal(images);
  if (mode === "diagonal-left") return mergeDiagonalLeft(images);
  if (mode === "diagonal-right") return mergeDiagonalRight(images);
  if (mode === "diagonal-x") return mergeDiagonalX(images);
  throw new Error("Unknown merge mode");
}

/** 多图自动化：分割 → 轮询选片 → 合并 */
export function autoCutAndMerge(
  images: HTMLImageElement[],
  mode: CutMode,
  pieces: number
): HTMLCanvasElement {
  if (images.length < 2) {
    throw new Error("至少需要2张图片");
  }

  const pieceCount = mode === "diagonal-x" ? 4 : pieces;
  const refWidth = images[0].naturalWidth;
  const refHeight = images[0].naturalHeight;

  for (let i = 1; i < images.length; i++) {
    if (
      images[i].naturalWidth !== refWidth ||
      images[i].naturalHeight !== refHeight
    ) {
      throw new Error("所有图片尺寸必须一致");
    }
  }

  const piecesByImage = images.map((img) => splitImage(img, mode, pieces));
  const selectedPieces = interleavePieces(piecesByImage);

  if (selectedPieces.length !== pieceCount) {
    throw new Error(`碎片数量应为 ${pieceCount}，实际为 ${selectedPieces.length}`);
  }

  return mergePieces(selectedPieces, mode);
}
