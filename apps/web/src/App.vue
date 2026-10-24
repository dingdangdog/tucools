<template>
  <AppShell />
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import AppShell from "@/components/AppShell.vue";
import { useUiStore } from "@/stores/ui";

const ui = useUiStore();
onMounted(() => ui.init());
</script>
