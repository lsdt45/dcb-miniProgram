import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import AutoImport from 'unplugin-auto-import/vite'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni(), AutoImport({ /* options */
    imports: ["vue", "vue-router"]
  }),],
  // server: {
  //   host: "192.168.31.253",
  //   port: 5173,
  //   https: false,
  // }
});
