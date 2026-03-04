import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Function to wait for service worker to activate and control the page
async function waitForServiceWorkerControl(registration) {
  // Wait for service worker to be ready
  await navigator.serviceWorker.ready
  console.log('Service worker is ready')
  
  // Wait for activation if installing
  if (registration.installing) {
    await new Promise((resolve) => {
      registration.installing.addEventListener('statechange', () => {
        if (registration.installing.state === 'activated') {
          console.log('Service worker activated')
          resolve()
        }
      })
    })
  }
  
  // Wait for waiting service worker to activate
  if (registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    await registration.update()
  }
  
  // Wait a bit for the service worker to claim clients
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Check if service worker is controlling
  if (navigator.serviceWorker.controller) {
    console.log('Service worker is controlling the page')
  } else {
    // Check if we've already tried reloading (prevent infinite loop)
    // const hasReloaded = sessionStorage.getItem('sw-reload-attempted')
    // if (!hasReloaded) {
    //   console.warn('Service worker registered but not controlling the page. Reloading to activate...')
    //   sessionStorage.setItem('sw-reload-attempted', 'true')
      // Reload the page to get service worker control
      // This ensures the service worker intercepts requests immediately
      window.location.reload()
    //   return // Exit early since we're reloading
    // } else {
    //   console.warn('Service worker still not controlling after reload. It may need manual activation.')
    //   sessionStorage.removeItem('sw-reload-attempted') // Reset for next session
    // }
  }
}

// Function to compute service worker path from current page directory
function getServiceWorkerPath() {
  const currentUrl = new URL(window.location.href)
  const currentPath = currentUrl.pathname
  
  // Get the directory path (remove filename if present)
  let dirPath = currentPath
  if (dirPath.endsWith('.html') || dirPath.endsWith('/')) {
    // Remove filename or trailing slash
    dirPath = dirPath.replace(/\/[^/]*$/, '')
  } else {
    // If path doesn't end with / or .html, get parent directory
    dirPath = dirPath.substring(0, dirPath.lastIndexOf('/'))
  }
  
  // Ensure path starts with / and ends with / for scope
  if (!dirPath.startsWith('/')) {
    dirPath = '/' + dirPath
  }
  const scope = dirPath + '/'
  
  // Service worker path is in the same directory
  const swPath = dirPath + '/sw.js'
  return { swPath, scope }
}

// Function to register and wait for service worker
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const { swPath, scope } = getServiceWorkerPath()
      
      // Try to register with computed path
      let registration
      try {
        registration = await navigator.serviceWorker.register(swPath, { scope })
        console.log('Service worker registered at:', swPath)
      } catch (primaryError) {
        console.warn('Failed to register with computed path, trying alternatives...', primaryError)
        
        // Try alternative paths
        const alternatives = [
          { path: '/task-manager/sw.js', scope: '/task-manager/' },
          { path: '/sw.js', scope: '/' },
          { path: './sw.js', scope: './' }
        ]
        
        let registered = false
        for (const alt of alternatives) {
          try {
            registration = await navigator.serviceWorker.register(alt.path, { scope: alt.scope })
            console.log('Service worker registered at alternative path:', alt.path)
            registered = true
            break
          } catch (altError) {
            // Continue to next alternative
            console.warn(`Failed to register at ${alt.path}:`, altError.message)
          }
        }
        
        if (!registered) {
          throw new Error('Could not register service worker with any path')
        }
      }
      
      await waitForServiceWorkerControl(registration)
    } catch (error) {
      console.error('Service worker registration failed:', error)
      // Don't block app initialization if service worker fails
    }
  }
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
