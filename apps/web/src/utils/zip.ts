import JSZip from "jszip";
import { saveAs } from "file-saver";

export async function downloadBlobsAsZip(
  files: { name: string; blob: Blob }[],
  zipName: string
) {
  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.name, file.blob);
  }
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, zipName);
}
