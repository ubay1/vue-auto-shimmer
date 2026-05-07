import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'
import dts from 'vite-plugin-dts'

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    return {
      root: resolve(__dirname, 'playground'),
      plugins: [vue()],
      resolve: {
        alias: {
          '@ubay182/vue-auto-shimmer': resolve(__dirname, 'src/index.ts')
        }
      },
      server: { open: true }
    }
  }

  return {
    plugins: [
      vue(),
      dts({
        insertTypesEntry: true,
        exclude: ['playground', 'node_modules']
      })
    ],
    build: {
      copyPublicDir: false,
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'VueAutoShimmer',
        formats: ['es', 'cjs'],
        fileName: (format) => `vue-auto-shimmer.${format === 'es' ? 'mjs' : 'cjs'}`
      },
      rollupOptions: {
        external: ['vue'],
        output: { globals: { vue: 'Vue' } }
      },
      sourcemap: true,
      emptyOutDir: true
    }
  }
})