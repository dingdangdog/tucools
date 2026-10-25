import { defineStore } from "pinia";
import { ref } from "vue";

export const useUiStore = defineStore("ui", () => {
  const navOpen = ref(false);
  const navRail = ref(false);
  const theme = ref<"light" | "dark">("light");

  function init() {
    theme.value = document.documentElement.classList.contains("dark") ? "dark" : "light";
    navRail.value = document.documentElement.classList.contains("nav-rail");
  }

  function toggleTheme() {
    theme.value = theme.value === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", theme.value === "dark");
    document.documentElement.style.colorScheme = theme.value;
    localStorage.setItem("tucools-theme", theme.value);
  }

  function toggleNavRail() {
    navRail.value = !navRail.value;
    document.documentElement.classList.toggle("nav-rail", navRail.value);
    localStorage.setItem("tucools-nav-rail", navRail.value ? "1" : "0");
  }

  return { navOpen, navRail, theme, init, toggleTheme, toggleNavRail };
});
