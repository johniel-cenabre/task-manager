import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'Task Manager',
        short_name: 'Tasks',
        description: 'A modern task management system',
        theme_color: '#ffffff',
        icons: []
      }
    })
  ],
  server: {
    port: 3000
  },
  build: {
    outDir: '..',
    emptyOutDir: false,
    assetsDir: '',
    rollupOptions: {
      output: {
        assetFileNames: '[name].[ext]',
        chunkFileNames: '[name].js',
        entryFileNames: '[name].js'
      }
    }
  }
})
