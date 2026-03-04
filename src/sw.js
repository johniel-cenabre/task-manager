/* eslint-env serviceworker */
// Combined SW: Workbox precache (injected by vite-plugin-pwa) + custom /api/tasks (IndexedDB)
import { precacheAndRoute } from 'workbox-precaching'

// Injection point for vite-plugin-pwa injectManifest – do not remove
precacheAndRoute(self.__WB_MANIFEST)

// --- Custom API (IndexedDB) ---
const DB_NAME = 'TaskManagerDB'
const DB_VERSION = 1
const STORE_NAME = 'tasks'

let db = null

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }
    request.onupgradeneeded = (event) => {
      const database = event.target.result
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
        store.createIndex('status', 'status', { unique: false })
        store.createIndex('createdAt', 'createdAt', { unique: false })
      }
    }
  })
}

async function getAllTasks() {
  if (!db) await initDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], 'readonly')
    const request = tx.objectStore(STORE_NAME).getAll()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

async function getTasksByStatus(status) {
  if (!db) await initDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], 'readonly')
    const request = tx.objectStore(STORE_NAME).index('status').getAll(status)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

async function getTaskById(id) {
  if (!db) await initDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], 'readonly')
    const request = tx.objectStore(STORE_NAME).get(id)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

async function createTask(task) {
  if (!db) await initDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], 'readwrite')
    const newTask = {
      ...task,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const request = tx.objectStore(STORE_NAME).add(newTask)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      newTask.id = request.result
      resolve(newTask)
    }
  })
}

async function updateTask(id, updates) {
  if (!db) await initDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const getRequest = store.get(id)
    getRequest.onerror = () => reject(getRequest.error)
    getRequest.onsuccess = () => {
      const task = getRequest.result
      if (!task) {
        reject(new Error('Task not found'))
        return
      }
      const updatedTask = { ...task, ...updates, updatedAt: new Date().toISOString() }
      const putRequest = store.put(updatedTask)
      putRequest.onerror = () => reject(putRequest.error)
      putRequest.onsuccess = () => resolve(updatedTask)
    }
  })
}

async function deleteTask(id) {
  if (!db) await initDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME], 'readwrite')
    const request = tx.objectStore(STORE_NAME).delete(id)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(id)
  })
}

function sendJSONResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}

function sendErrorResponse(message, status = 500) {
  return sendJSONResponse({ error: message }, status)
}

function parseRoute(url) {
  const urlObj = new URL(url)
  const path = urlObj.pathname
  const parts = path.split('/').filter(Boolean)
  return { path, parts, query: Object.fromEntries(urlObj.searchParams) }
}

async function handleAPIRequest(request) {
  const route = parseRoute(request.url)
  const method = request.method
  const { parts } = route

  try {
    if (!db) await initDB()

    const apiIndex = parts.findIndex((part) => part === 'api')
    if (apiIndex === -1) return sendErrorResponse('Invalid API route', 404)

    const apiParts = parts.slice(apiIndex + 1)
    const len = apiParts.length

    if (method === 'GET' && len === 1 && apiParts[0] === 'tasks') {
      return sendJSONResponse(await getAllTasks())
    }
    if (method === 'GET' && len === 3 && apiParts[0] === 'tasks' && apiParts[1] === 'status') {
      return sendJSONResponse(await getTasksByStatus(apiParts[2]))
    }
    if (method === 'GET' && len === 2 && apiParts[0] === 'tasks') {
      const id = parseInt(apiParts[1], 10)
      if (Number.isNaN(id)) return sendErrorResponse('Invalid task ID', 400)
      const task = await getTaskById(id)
      if (!task) return sendErrorResponse('Task not found', 404)
      return sendJSONResponse(task)
    }
    if (method === 'POST' && len === 1 && apiParts[0] === 'tasks') {
      const taskData = await request.json()
      const task = await createTask(taskData)
      return sendJSONResponse(task, 201)
    }
    if (method === 'PUT' && len === 2 && apiParts[0] === 'tasks') {
      const id = parseInt(apiParts[1], 10)
      if (Number.isNaN(id)) return sendErrorResponse('Invalid task ID', 400)
      const updates = await request.json()
      const task = await updateTask(id, updates)
      return sendJSONResponse(task)
    }
    if (method === 'DELETE' && len === 2 && apiParts[0] === 'tasks') {
      const id = parseInt(apiParts[1], 10)
      if (Number.isNaN(id)) return sendErrorResponse('Invalid task ID', 400)
      await deleteTask(id)
      return sendJSONResponse({ message: 'Task deleted successfully' }, 200)
    }
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    }
    return sendErrorResponse('Route not found', 404)
  } catch (err) {
    return sendErrorResponse(err.message || 'Internal server error', 500)
  }
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting()
})

// Register our API fetch first so we respond for /api/*; other requests are handled by Workbox precache or network
self.addEventListener('fetch', (event) => {
  const pathname = new URL(event.request.url).pathname
  if (pathname.endsWith('/favicon.ico')) {
    event.respondWith(new Response(null, { status: 204 }))
    return
  }
  if (pathname.includes('/api/')) {
    event.respondWith(handleAPIRequest(event.request.clone()))
  }
})

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(initDB())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(Promise.all([initDB(), self.clients.claim()]))
})
