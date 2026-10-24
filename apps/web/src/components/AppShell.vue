<template>
  <div class="flex h-full min-h-0">
    <div
      v-if="ui.navOpen"
      class="fixed inset-0 z-30 bg-black/40 md:hidden"
      @click="ui.navOpen = false"
    />
    <aside
      class="nav-drawer fixed inset-y-0 start-0 z-40 flex w-60 flex-col border-e border-line bg-[var(--sidebar)] text-[var(--sidebar-ink)] md:static"
      :class="{ 'is-open': ui.navOpen }"
    >
      <div class="flex items-center justify-between gap-2 px-3 py-3">
        <RouterLink :to="homeTo" class="flex min-w-0 items-center gap-2 text-base font-semibold" @click="ui.navOpen = false">
          <img src="/logo.webp" alt="" class="h-8 w-8 shrink-0 rounded-lg" />
          <span class="truncate">{{ copy.appName }}</span>
        </RouterLink>
        <button type="button" class="btn md:hidden" @click="ui.navOpen = false">
          <XMarkIcon class="h-4 w-4" />
          {{ copy.closeNav }}
        </button>
      </div>
      <nav class="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        <RouterLink
          :to="homeTo"
          class="nav-link"
          active-class="is-ancestor"
          exact-active-class="router-link-active"
          @click="ui.navOpen = false"
        >
          <HomeIcon class="h-4 w-4 shrink-0" />
          <span class="truncate">{{ copy.allFeatures }}</span>
        </RouterLink>
        <template v-for="group in menus.groups" :key="group.id">
          <p class="nav-label">{{ group.label }}</p>
          <RouterLink
            v-for="item in group.items"
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
      <header class="relative z-20 flex h-12 shrink-0 items-center gap-3 border-b border-line px-3 md:px-4">
        <button type="button" class="btn md:hidden" @click="ui.navOpen = true">
          <Bars3Icon class="h-4 w-4" />
          {{ copy.openNav }}
        </button>
        <h1 class="min-w-0 flex-1 truncate text-sm font-semibold">{{ title }}</h1>
        <LocaleSelect />
        <RouterLink v-if="menus.client" :to="menusTo" class="btn shrink-0" :aria-label="copy.menus.open">
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
import { Bars3Icon, Cog6ToothIcon, HomeIcon, MoonIcon, SunIcon, XMarkIcon } from "@heroicons/vue/24/outline";
import { copy, currentLocale } from "@/content";
import { localePath } from "@/locale";
import { seoPageFor } from "@/seo";
import LocaleSelect from "@/components/LocaleSelect.vue";
import { useMenuStore } from "@/stores/menus";
import { useUiStore } from "@/stores/ui";

const ui = useUiStore();
const menus = useMenuStore();
const route = useRoute();
const homeTo = computed(() => localePath("/", currentLocale.value));
const menusTo = computed(() => localePath("/menus", currentLocale.value));
const title = computed(() => seoPageFor(copy, route.path).heading);
const themeLabel = computed(() => (ui.theme === "dark" ? copy.themeToLight : copy.themeToDark));
</script>
