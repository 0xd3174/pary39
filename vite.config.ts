import { defineConfig, Plugin } from 'vite';
import preact from '@preact/preset-vite';
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  base: "https://0xd3174.github.io/pary39r/",
  plugins: [preact()],
  build: {
    rollupOptions: {
      plugins: [
        visualizer({
          gzipSize: true,
          brotliSize: true,
        }) as Plugin,
      ],
    },
    outDir: 'dist',
  },
});
