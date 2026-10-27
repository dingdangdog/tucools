<template>
  <div class="app-frame flex h-auto min-h-0 items-stretch overflow-clip">
    <div
      v-if="ui.navOpen"
      class="fixed inset-0 z-30 bg-black/50 md:hidden"
      @click="ui.navOpen = false"
    />
    <aside class="nav-drawer fixed inset-y-0 start-0 z-40 flex flex-col overflow-hidden" :class="{ 'is-open': ui.navOpen }">
      <div class="flex items-center gap-1 px-2 py-3">
        <RouterLink :to="homeTo" class="brand" @click="ui.navOpen = false">
          <img src="/logo.webp" alt="" class="h-8 w-8 shrink-0 rounded-lg" />
          <span class="brand-name truncate text-sm font-semibold">{{ copy.appName }}</span>
        </RouterLink>
        <button type="button" class="icon-btn inline-flex md:hidden" :aria-label="copy.closeNav" @click="ui.navOpen = false">
          <XMarkIcon class="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <nav class="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        <RouterLink
          :to="homeTo"
          class="nav-link"
          active-class="is-ancestor"
          exact-active-class="router-link-active"
          :title="ui.navRail ? copy.allFeatures : undefined"
          @click="ui.navOpen = false"
        >
          <HomeIcon class="h-4 w-4 shrink-0" />
          <span class="nav-text truncate">{{ copy.allFeatures }}</span>
        </RouterLink>
        <template v-for="group in menus.groups" :key="group.id">
          <p class="nav-label">{{ group.label }}</p>
          <RouterLink v-for="item in group.items" :key="item.id" :to="target(item)" custom v-slot="{ href, navigate }">
            <a
              :href="href"
              class="nav-link"
              :class="{ 'router-link-active': itemActive(item) }"
              :aria-current="itemActive(item) ? 'page' : undefined"
              :title="ui.navRail ? item.label : undefined"
              @click="onNav(navigate, $event)"
            >
              <component :is="item.icon" class="h-4 w-4 shrink-0" />
              <span class="nav-text truncate">{{ item.label }}</span>
            </a>
          </RouterLink>
        </template>
      </nav>
      <div class="nav-foot">
        <button
          type="button"
          class="icon-btn hidden md:inline-flex"
          :aria-label="ui.navRail ? copy.expandNav : copy.collapseNav"
          :title="ui.navRail ? copy.expandNav : copy.collapseNav"
          :aria-expanded="!ui.navRail"
          @click="ui.toggleNavRail()"
        >
          <component :is="collapseIcon" class="h-4 w-4" aria-hidden="true" />
        </button>
        <button type="button" class="icon-btn inline-flex" :aria-label="themeLabel" :title="themeLabel" @click="ui.toggleTheme()">
          <SunIcon v-if="ui.theme === 'dark'" class="h-4 w-4" />
          <MoonIcon v-else class="h-4 w-4" />
        </button>
        <RouterLink
          v-if="menus.client"
          :to="menusTo"
          class="icon-btn inline-flex"
          :aria-label="copy.menus.open"
          :title="copy.menus.open"
          @click="ui.navOpen = false"
        >
          <Cog6ToothIcon class="h-4 w-4" />
        </RouterLink>
        <RouterLink
          :to="versionTo"
          class="icon-btn inline-flex"
          :aria-label="copy.version.open"
          :title="copy.version.open"
          @click="ui.navOpen = false"
        >
          <TagIcon class="h-4 w-4" />
        </RouterLink>
        <a class="icon-btn inline-flex" :href="projectRepo" target="_blank" rel="noopener noreferrer" :aria-label="copy.github" :title="copy.github">
          <svg class="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path
              d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.19.19.82.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"
            />
          </svg>
        </a>
      </div>
      <a
        v-if="icpNumber"
        class="nav-icp"
        href="https://beian.miit.gov.cn/"
        target="_blank"
        rel="noopener noreferrer"
      >{{ icpNumber }}</a>
    </aside>
    <div class="app-body flex h-auto min-h-0 min-w-0 flex-1 flex-col overflow-clip">
      <header class="app-top relative z-20 flex h-14 shrink-0 items-center gap-2 px-3 md:px-5">
        <button type="button" class="icon-btn inline-flex shrink-0 md:hidden" :aria-label="copy.openNav" @click="ui.navOpen = true">
          <Bars3Icon class="h-5 w-5" aria-hidden="true" />
        </button>
        <h1 class="min-w-0 flex-1 truncate text-lg font-medium">{{ title }}</h1>
        <LocaleSelect />
      </header>
      <CropModes />
      <main class="flex min-h-0 min-w-0 flex-1 flex-col overflow-clip">
        <RouterView :key="$route.fullPath" />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import {
  Bars3Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  HomeIcon,
  MoonIcon,
  SunIcon,
  TagIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";
import { copy, currentLocale } from "@/content";
import { featureIdFromPath } from "@/features";
import { localeByCode, localePath } from "@/locale";
import { isCropMode, type NavItem } from "@/nav";
import { projectRepo } from "@/release";
import { loadRuntimeConfig, runtimeConfigNow } from "@/runtime-config";
import { seoPageFor } from "@/seo";
import CropModes from "@/components/CropModes.vue";
import LocaleSelect from "@/components/LocaleSelect.vue";
import { useMenuStore } from "@/stores/menus";
import { useUiStore } from "@/stores/ui";

const ui = useUiStore();
const menus = useMenuStore();
const route = useRoute();
const homeTo = computed(() => localePath("/", currentLocale.value));
const menusTo = computed(() => localePath("/menus", currentLocale.value));
const versionTo = computed(() => localePath("/version", currentLocale.value));
function target(item: NavItem) {
  if (item.id !== "cropping") return item.to;
  return localePath(menus.cropEntryPath, currentLocale.value);
}

function itemActive(item: NavItem) {
  const id = featureIdFromPath(route.path);
  if (!id) return false;
  if (item.id === "cropping") return isCropMode(id);
  return id === item.id;
}

function onNav(navigate: (event?: MouseEvent) => void, event: MouseEvent) {
  navigate(event);
  ui.navOpen = false;
}
const page = computed(() => seoPageFor(copy, route.path));
const title = computed(() => (page.value.id === "home" ? copy.allFeatures : page.value.heading));
const themeLabel = computed(() => (ui.theme === "dark" ? copy.themeToLight : copy.themeToDark));
const isRtl = computed(() => localeByCode(currentLocale.value).dir === "rtl");
const collapseIcon = computed(() => (ui.navRail !== isRtl.value ? ChevronRightIcon : ChevronLeftIcon));
const icpNumber = ref(runtimeConfigNow()?.icpNumber ?? "");
onMounted(async () => {
  icpNumber.value = (await loadRuntimeConfig()).icpNumber;
});
</script>
