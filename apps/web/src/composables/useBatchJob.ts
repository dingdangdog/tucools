import { onScopeDispose, ref, watch, type WatchSource } from "vue";

export function useBatchJob(triggers: WatchSource<unknown>[], rerun: () => void, delay = 280) {
  const files = ref<File[]>([]);
  let timer = 0;
  let generation = 0;

  function replace(next: File[]) {
    files.value = next.slice();
  }

  function clear() {
    files.value = [];
    generation += 1;
    window.clearTimeout(timer);
  }

  function start() {
    generation += 1;
    const token = generation;
    return () => token === generation;
  }

  watch(triggers, () => {
    if (!files.value.length) return;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      if (files.value.length) rerun();
    }, delay);
  });

  onScopeDispose(() => {
    generation += 1;
    window.clearTimeout(timer);
  });

  return { files, replace, clear, start };
}

export function wholeNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  if (rounded < min || rounded > max) return null;
  return rounded;
}
