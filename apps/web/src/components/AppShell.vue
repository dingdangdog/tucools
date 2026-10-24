<template>
  <div class="flex h-full min-h-0">
    <div
      v-if="ui.navOpen"
      class="fixed inset-0 z-30 bg-black/40 md:hidden"
      @click="ui.navOpen = false"
    />
    <aside
      class="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-line bg-[var(--sidebar)] text-[var(--sidebar-ink)] transition-transform md:static md:translate-x-0"
      :class="ui.navOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
    >
      <div class="flex items-center justify-between gap-2 px-3 py-3">
        <RouterLink to="/" class="flex min-w-0 items-center gap-2 text-base font-semibold" @click="ui.navOpen = false">
          <img src="/logo.webp" alt="" class="h-8 w-8 shrink-0 rounded-lg" />
          <span class="truncate">{{ copy.appName }}</span>
        </RouterLink>
        <button type="button" class="btn md:hidden" @click="ui.navOpen = false">
          <XMarkIcon class="h-4 w-4" />
          {{ copy.closeNav }}
        </button>
      </div>
      <nav class="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        <template v-if="menus.localItems.length">
          <p class="nav-label">{{ copy.localGroup }}</p>
          <RouterLink
            v-for="item in menus.localItems"
            :key="item.to"
            :to="item.to"
            class="nav-link"
            @click="ui.navOpen = false"
          >
            <component :is="item.icon" class="h-4 w-4 shrink-0" />
            <span class="truncate">{{ item.label }}</span>
          </RouterLink>
        </template>
        <template v-if="menus.aiItems.length">
          <p class="nav-label">{{ copy.aiGroup }}</p>
          <RouterLink
            v-for="item in menus.aiItems"
            :key="item.to"
            :to="item.to"
            class="nav-link"
            @click="ui.navOpen = false"
          >
            <component :is="item.icon" class="h-4 w-4 shrink-0" />
            <span class="truncate">{{ item.label }}</span>
          </RouterLink>
        </template>
      </nav>
    </aside>
    <div class="flex min-w-0 flex-1 flex-col">
      <header class="flex h-12 shrink-0 items-center gap-3 border-b border-line px-3 md:px-4">
        <button type="button" class="btn md:hidden" @click="ui.navOpen = true">
          <Bars3Icon class="h-4 w-4" />
          {{ copy.openNav }}
        </button>
        <h1 class="min-w-0 flex-1 truncate text-sm font-semibold">{{ title }}</h1>
        <RouterLink v-if="menus.client" to="/menus" class="btn shrink-0" :aria-label="copy.menus.open">
          <Cog6ToothIcon class="h-4 w-4" />
          <span class="hidden sm:inline">{{ copy.menus.open }}</span>
        </RouterLink>
        <button type="button" class="btn shrink-0" :aria-label="themeLabel" @click="ui.toggleTheme()">
          <SunIcon v-if="ui.theme === 'dark'" class="h-4 w-4" />
          <MoonIcon v-else class="h-4 w-4" />
          <span class="hidden sm:inline">{{ themeLabel }}</span>
        </button>
      </header>
      <main class="min-h-0 flex-1 overflow-hidden">
        <RouterView :key="$route.fullPath" />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { Bars3Icon, Cog6ToothIcon, MoonIcon, SunIcon, XMarkIcon } from "@heroicons/vue/24/outline";
import { copy } from "@/content/zh";
import { useMenuStore } from "@/stores/menus";
import { useUiStore } from "@/stores/ui";

const ui = useUiStore();
const menus = useMenuStore();
const route = useRoute();
const title = computed(() => (route.path === "/" ? copy.appName : String(route.meta.title ?? copy.appName)));
const themeLabel = computed(() => (ui.theme === "dark" ? copy.themeToLight : copy.themeToDark));
</script>
