import "./index.css";
import { createApp } from "vue";
import { createPinia } from "pinia";
import { createI18n } from "vue-i18n";

import App from "./App.vue";
import router from "./router";
import ptBR from "./locales/pt-BR";

const i18n = createI18n({
  legacy: false,
  locale: "pt-BR",
  messages: { "pt-BR": ptBR },
});

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);

app.mount("#app");
