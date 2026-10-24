import { reactive, ref } from "vue";
import type { ResultItem } from "@/components/ResultGrid.vue";
import { copy } from "@/content/zh";
import { isProcessableImage } from "@/utils/image";
import { saveOrDownload } from "@/utils/save";
import { downloadBlobsAsZip } from "@/utils/zip";

export function useResults() {
  const items = ref<ResultItem[]>([]);
  const busy = ref(false);
  const error = ref("");
  const progress = ref("");

  function reset() {
    for (const item of items.value) URL.revokeObjectURL(item.url);
    items.value = [];
    error.value = "";
  }

  function add(name: string, blob: Blob, detail = "") {
    items.value.push({ name, blob, url: URL.createObjectURL(blob), detail });
  }

  function remove(index: number) {
    const item = items.value[index];
    if (!item) return;
    URL.revokeObjectURL(item.url);
    items.value.splice(index, 1);
  }

  async function download(item: ResultItem) {
    await saveOrDownload(item.blob, item.name);
  }

  async function downloadAll(zipName: string) {
    await downloadBlobsAsZip(
      items.value.map((item) => ({ name: item.name, blob: item.blob })),
      zipName
    );
  }

  function imagesOf(files: File[]) {
    const images = files.filter(isProcessableImage);
    if (!images.length) error.value = copy.noImage;
    return images;
  }

  return reactive({
    items,
    busy,
    error,
    progress,
    reset,
    add,
    remove,
    download,
    downloadAll,
    imagesOf,
  });
}
