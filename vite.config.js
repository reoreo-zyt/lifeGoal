import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    target: "es2015", // 或者其他你需要的目标环境
  },
  base: "./",
});
