import { downloadBlob } from "./image";

export async function saveOrDownload(blob: Blob, filename: string) {
  const bridge = window.tucools;
  if (bridge?.saveBytes) {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const outcome = await bridge.saveBytes(filename, bytes);
    if (outcome === "cancelled" || outcome === "saved") return;
  }
  downloadBlob(blob, filename);
}
