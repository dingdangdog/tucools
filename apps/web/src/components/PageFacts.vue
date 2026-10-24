<template>
  <section v-if="page && page.faqs.length" class="max-w-3xl shrink-0 border-t border-line pt-3">
    <h2 id="faq" class="mb-1 text-sm text-muted">{{ copy.seo.faqHeading }}</h2>
    <div>
      <details v-for="item in page.faqs" :key="item.q" class="border-b border-line py-2 last:border-b-0">
        <summary class="flex min-h-11 cursor-pointer items-center text-sm">{{ item.q }}</summary>
        <p class="mt-1 text-sm text-muted">{{ item.a }}</p>
      </details>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { copy } from "@/content";
import { seoPageFor } from "@/seo";

const route = useRoute();
const page = computed(() => seoPageFor(copy, route.path));
</script>
