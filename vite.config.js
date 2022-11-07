import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import path from 'path'
/**
 * @type {import('vite').UserConfig}
 */

export default defineConfig({
  build: {
    sourcemap: true,
  },
	resolve:{
    alias:{
      '@':path.resolve(__dirname,'./')
    }
  },
  plugins: [uni()],
});