<template>
  <div v-if="client && slot" class="panel shrink-0 p-3">
    <p class="mb-2 text-xs text-muted">{{ copy.adLabel }}</p>
    <div class="min-h-[250px] overflow-hidden">
      <ins
        class="adsbygoogle"
        style="display: block"
        :data-ad-client="client"
        :data-ad-slot="slot"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
import { copy } from "@/content";
import { loadRuntimeConfig, runtimeConfigNow, type RuntimeConfig } from "@/runtime-config";

const client = ref("");
const slot = ref("");

function apply(config: RuntimeConfig) {
  client.value = config.adsenseClient;
  slot.value = config.adsenseSlot;
}

const ready = runtimeConfigNow();
if (ready) apply(ready);

onMounted(async () => {
  apply(await loadRuntimeConfig());
  if (!client.value || !slot.value) return;
  await nextTick();
  try {
    const queue = window.adsbygoogle || [];
    window.adsbygoogle = queue;
    queue.push({});
  } catch {
    // 广告脚本被拦截或单元重复初始化时，工具本身仍可用。
  }
});
</script>
