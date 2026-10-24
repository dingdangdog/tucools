<template>
  <aside v-if="show" class="flex w-full shrink-0 flex-col gap-3 lg:h-full lg:w-80 lg:min-h-0">
    <AdSlot />
    <div v-if="hasFaq" class="panel min-h-0 p-3 lg:flex-1 lg:overflow-y-auto">
      <PageFacts embedded />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import AdSlot from "@/components/AdSlot.vue";
import PageFacts from "@/components/PageFacts.vue";
import { copy } from "@/content";
import { runtimeConfigNow } from "@/runtime-config";
import { seoPageFor } from "@/seo";

const route = useRoute();
const page = computed(() => seoPageFor(copy, route.path));
const hasFaq = computed(() => Boolean(page.value?.faqs.length));
const hasAd = computed(() => {
  const config = runtimeConfigNow();
  return Boolean(config?.adsenseClient && config.adsenseSlot);
});
const show = computed(() => hasFaq.value || hasAd.value);
</script>
