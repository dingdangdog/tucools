<template>
  <section v-if="page && page.faqs.length" :class="embedded ? 'break-words' : 'max-w-3xl shrink-0 break-words border-t border-line pt-3'">
    <h2 id="faq" class="mb-1 text-sm text-muted">{{ copy.seo.faqHeading }}</h2>
    <div>
      <details v-for="item in page.faqs" :key="item.q" class="border-b border-line py-2 last:border-b-0">
        <summary class="cursor-pointer py-2 text-sm leading-5">{{ item.q }}</summary>
        <p class="mt-1 text-sm text-muted">{{ item.a }}</p>
      </details>
    </div>
    <nav v-if="related.length" class="mt-3" :aria-label="copy.seo.relatedHeading">
      <h2 class="mb-1 text-sm text-muted">{{ copy.seo.relatedHeading }}</h2>
      <ul class="flex flex-col gap-1">
        <li v-for="item in related" :key="item.path">
          <RouterLink class="text-sm text-link" :to="localePath(item.path, currentLocale)">{{ item.heading }}</RouterLink>
        </li>
      </ul>
    </nav>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { copy, currentLocale } from "@/content";
import { localePath } from "@/locale";
import { relatedSeoPages, seoPageFor } from "@/seo";

defineProps<{ embedded?: boolean }>();

const route = useRoute();
const page = computed(() => seoPageFor(copy, route.path));
const related = computed(() => relatedSeoPages(copy, page.value));
</script>
