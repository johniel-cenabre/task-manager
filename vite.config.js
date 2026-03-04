import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { readdir, unlink } from 'fs/promises'
import { join } from 'path'

// Plugin to clean old workbox files before build
const cleanWorkboxPlugin = () => {
  return {
    name: 'clean-workbox',
    buildStart: async () => {
      try {
        const rootDir = process.cwd()
        const files = await readdir(rootDir)
        const workboxFiles = files.filter(file => 
          file.startsWith('workbox-') && file.endsWith('.js')
        )
        
        if (workboxFiles.length > 0) {
          console.log(`Cleaning ${workboxFiles.length} old workbox file(s)...`)
          for (const file of workboxFiles) {
            const filePath = join(rootDir, file)
            await unlink(filePath)
            console.log(`  ✓ Removed: ${file}`)
          }
        }
      } catch (error) {
        // Ignore errors if directory doesn't exist or files can't be deleted
        if (error.code !== 'ENOENT') {
          console.warn('Could not clean workbox files:', error.message)
        }
      }
    }
  }
}

export default defineConfig({
  base: '/task-manager/',
  root: 'src',
  publicDir: '../public',
  plugins: [
    vue(),
    cleanWorkboxPlugin(),
    VitePWA({
      registerType: null,
      base: '/task-manager/',
      scope: '/task-manager/',
      strategies: 'injectManifest',
      injectRegister: null,
      srcDir: '.',
      filename: 'sw.js',
      manifest: {
        name: 'Task Manager',
        short_name: 'Tasks',
        description: 'A modern task management system',
        theme_color: '#ffffff',
        start_url: '/task-manager/',
        scope: '/task-manager/',
        icons: []
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  server: {
    port: 3000
  },
  preview: {
    port: 4173,
    strictPort: true,
    cors: true
  },
  build: {
    outDir: '..',
    emptyOutDir: false,
    assetsDir: '',
    copyPublicDir: true,
    rollupOptions: {
      output: {
        assetFileNames: '[name].[ext]',
        chunkFileNames: '[name].js',
        entryFileNames: '[name].js'
      }
    }
  }
})
