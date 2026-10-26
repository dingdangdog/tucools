import { computed, reactive } from "vue";

export type ModelPackPhase = "idle" | "downloading" | "extracting" | "done" | "error";

const state = reactive({
  phase: "idle" as ModelPackPhase,
  received: 0,
  total: 0,
  error: "",
});

let listening = false;

export function canDownloadModelPack() {
  return typeof window !== "undefined" && typeof window.tucools?.downloadModelPack === "function";
}

function ensureListener() {
  if (listening || !window.tucools?.onModelPackProgress) return;
  listening = true;
  window.tucools.onModelPackProgress((progress) => {
    if (state.phase === "done" || state.phase === "error") return;
    state.phase = progress.phase;
    state.received = progress.received;
    state.total = progress.total;
  });
}

export function useModelPackDownload() {
  const running = computed(() => state.phase === "downloading" || state.phase === "extracting");

  async function start() {
    if (!window.tucools?.downloadModelPack || running.value) return;
    ensureListener();
    state.phase = "downloading";
    state.received = 0;
    state.total = 0;
    state.error = "";
    const result = await window.tucools.downloadModelPack();
    if (result.ok) {
      state.phase = "done";
      state.received = 0;
      state.total = 0;
      window.dispatchEvent(new CustomEvent("tucools-models-installed"));
      return;
    }
    if (result.code === "cancelled") {
      state.phase = "idle";
      state.error = "cancelled";
      return;
    }
    state.phase = "error";
    state.error = result.code || "network";
  }

  function cancel() {
    void window.tucools?.cancelModelPack?.();
  }

  return { state, running, start, cancel };
}
