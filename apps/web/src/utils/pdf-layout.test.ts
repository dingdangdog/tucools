import assert from "node:assert/strict";
import test from "node:test";
import { exportPixelSize, layoutPdfPage, pointsToMm } from "./pdf-layout.ts";

function close(actual: number, expected: number) {
  assert.ok(Math.abs(actual - expected) < 0.02, `${actual} !~ ${expected}`);
}

test("A4 follows the image direction and keeps the whole picture", () => {
  const landscape = layoutPdfPage(2000, 1000, "a4", "auto", "contain", 0);
  close(landscape.pageWidth, 841.89);
  close(landscape.pageHeight, 595.28);
  close(landscape.x, 0);
  close(landscape.width, landscape.pageWidth);

  const portrait = layoutPdfPage(1000, 2000, "a4", "auto", "contain", 0);
  close(portrait.pageWidth, 595.28);
  close(portrait.pageHeight, 841.89);
  assert.equal(pointsToMm(portrait.pageWidth), 210);
  assert.equal(pointsToMm(portrait.pageHeight), 297);
});

test("forced portrait letterboxes a wide image inside the margin", () => {
  const layout = layoutPdfPage(2000, 1000, "a4", "portrait", "contain", 0.1);
  close(layout.pageWidth, 595.28);
  close(layout.pageHeight, 841.89);
  const inset = Math.min(layout.pageWidth, layout.pageHeight) * 0.1;
  assert.ok(layout.x >= inset - 0.02);
  assert.ok(layout.y >= inset - 0.02);
  assert.ok(layout.x + layout.width <= layout.pageWidth - inset + 0.02);
  assert.ok(layout.y + layout.height <= layout.pageHeight - inset + 0.02);
  close(layout.sw, 2000);
  close(layout.sh, 1000);
});

test("cover crops inside the source and stretch fills the inner page", () => {
  const cover = layoutPdfPage(1000, 1000, "a4", "portrait", "cover", 0);
  close(cover.x, 0);
  close(cover.y, 0);
  close(cover.width, cover.pageWidth);
  close(cover.height, cover.pageHeight);
  assert.ok(cover.sx >= -0.02);
  assert.ok(cover.sy >= -0.02);
  assert.ok(cover.sx + cover.sw <= 1000.02);
  assert.ok(cover.sy + cover.sh <= 1000.02);
  assert.ok(cover.sw < 1000);

  const stretch = layoutPdfPage(1000, 500, "letter", "landscape", "stretch", 0);
  close(stretch.pageWidth, 792);
  close(stretch.pageHeight, 612);
  close(stretch.width, stretch.pageWidth);
  close(stretch.height, stretch.pageHeight);
  close(stretch.sw, 1000);
  close(stretch.sh, 500);
});

test("original ratio keeps the picture shape at A4's long edge", () => {
  const layout = layoutPdfPage(2000, 1000, "original", "auto", "contain", 0);
  close(layout.pageWidth / layout.pageHeight, 2);
  close(layout.pageWidth, 841.89);
  close(layout.width, layout.pageWidth);
  close(layout.height, layout.pageHeight);
});

test("export pixels follow 150 DPI and cap the long edge", () => {
  const a4 = exportPixelSize({ pageWidth: 595.28, pageHeight: 841.89 });
  assert.deepEqual(a4, { width: 1240, height: 1754 });
  const capped = exportPixelSize({ pageWidth: 10000, pageHeight: 5000 });
  assert.equal(Math.max(capped.width, capped.height), 4096);
  close(capped.width / capped.height, 2);
});
