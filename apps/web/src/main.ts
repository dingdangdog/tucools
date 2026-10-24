import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { router } from "./router";
import { useMenuStore } from "@/stores/menus";
import "./styles.css";

async function boot() {
  const app = createApp(App);
  const pinia = createPinia();
  app.use(pinia);
  await useMenuStore().load();
  app.use(router);
  app.mount("#app");
}

void boot();
