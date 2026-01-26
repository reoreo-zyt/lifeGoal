import { createApp } from "vue";
import { createMUI } from "shuimo-ui";
import "shuimo-ui/dist/style.css";
import "./style.css";
import App from "./App.vue";

createApp(App).use(createMUI()).mount("#app");
