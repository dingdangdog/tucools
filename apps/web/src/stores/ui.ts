import { defineStore } from "pinia";
import { ref } from "vue";

export const useUiStore = defineStore("ui", () => {
  const navOpen = ref(false);
  const theme = ref<"light" | "dark">("light");

  function init() {
    theme.value = document.documentElement.classList.contains("dark") ? "dark" : "light";
  }

  function toggleTheme() {
    theme.value = theme.value === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", theme.value === "dark");
    document.documentElement.style.colorScheme = theme.value;
    localStorage.setItem("tucools-theme", theme.value);
  }

  return { navOpen, theme, init, toggleTheme };
});
