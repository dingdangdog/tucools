<template>
  <ins
    v-if="client && slot"
    class="adsbygoogle"
    style="display: block"
    :data-ad-client="client"
    :data-ad-slot="slot"
    data-ad-format="auto"
    data-full-width-responsive="true"
  />
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";
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
