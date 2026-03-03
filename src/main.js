import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Function to register and wait for service worker
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      // Get base path from Vite's BASE_URL
      const basePath = import.meta.env.BASE_URL || '/task-manager/'
      // Remove trailing slash for path construction
      const base = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath
      const swPath = `${base}/sw.js`
      const scope = basePath
      
      console.log('Attempting to register service worker at:', swPath, 'with scope:', scope)
      console.log('Base URL:', import.meta.env.BASE_URL)
      console.log('Current location:', window.location.href)
      
      // Try to register the service worker
      let registration
      try {
        registration = await navigator.serviceWorker.register(swPath, {
          scope: scope
        })
      } catch (registerError) {
        console.warn('Failed to register with base path, trying root path:', registerError)
        // Fallback: try root path if base path fails (for development/preview)
        const rootPath = '/sw.js'
        registration = await navigator.serviceWorker.register(rootPath, {
          scope: '/'
        })
        console.log('Service Worker registered with root path fallback')
      }
      console.log('Service Worker registered:', registration)
      
      // Wait for service worker to be activated
      if (registration.installing) {
        await new Promise((resolve) => {
          const installing = registration.installing
          installing.addEventListener('statechange', () => {
            if (installing.state === 'activated') {
              console.log('Service Worker activated')
              resolve()
            }
          })
        })
      } else if (registration.waiting) {
        // If waiting, skip waiting
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        await registration.update()
      }
      
      // Ensure service worker is ready and controlling
      await navigator.serviceWorker.ready
      
      // Wait a bit more to ensure it's fully ready
      await new Promise(resolve => setTimeout(resolve, 100))
      
      console.log('Service Worker is ready and controlling:', !!navigator.serviceWorker.controller)
      return true
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return false
    }
  }
  return false
}

// Initialize app after service worker is ready
async function initApp() {
  // Register service worker
  await registerServiceWorker()
  
  // Create and mount Vue app
  createApp(App).mount('#app')
}

// Start initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp)
} else {
  initApp()
}
