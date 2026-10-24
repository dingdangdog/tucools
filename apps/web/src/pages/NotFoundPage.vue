<template>
  <div class="h-full overflow-y-auto p-4 md:p-6">
    <p class="max-w-3xl text-sm text-muted">{{ copy.seo.missingBody }}</p>
    <RouterLink :to="homeTo" class="mt-3 inline-flex text-sm text-link">{{ copy.seo.backHome }}</RouterLink>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { copy, currentLocale } from "@/content";
import { localePath } from "@/locale";

const homeTo = computed(() => localePath("/", currentLocale.value));
</script>
