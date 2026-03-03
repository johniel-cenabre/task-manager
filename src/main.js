import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Function to register and wait for service worker
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })
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
