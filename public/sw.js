// Service Worker for IndexedDB API
const DB_NAME = 'TaskManagerDB'
const DB_VERSION = 1
const STORE_NAME = 'tasks'

let db = null

// Initialize IndexedDB
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
        objectStore.createIndex('status', 'status', { unique: false })
        objectStore.createIndex('createdAt', 'createdAt', { unique: false })
      }
    }
  })
}

// Get all tasks
async function getAllTasks() {
  if (!db) await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

// Get tasks by status
async function getTasksByStatus(status) {
  if (!db) await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index('status')
    const request = index.getAll(status)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

// Get task by ID
async function getTaskById(id) {
  if (!db) await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

// Create task
async function createTask(task) {
  if (!db) await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const newTask = {
      ...task,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const request = store.add(newTask)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      newTask.id = request.result
      resolve(newTask)
    }
  })
}

// Update task
async function updateTask(id, updates) {
  if (!db) await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const getRequest = store.get(id)

    getRequest.onerror = () => reject(getRequest.error)
    getRequest.onsuccess = () => {
      const task = getRequest.result
      if (!task) {
        reject(new Error('Task not found'))
        return
      }

      const updatedTask = {
        ...task,
        ...updates,
        updatedAt: new Date().toISOString()
      }
      const putRequest = store.put(updatedTask)

      putRequest.onerror = () => reject(putRequest.error)
      putRequest.onsuccess = () => resolve(updatedTask)
    }
  })
}

// Delete task
async function deleteTask(id) {
  if (!db) await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(id)
  })
}

// Helper function to send JSON response
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

// Helper function to send error response
function sendErrorResponse(message, status = 500) {
  return sendJSONResponse({ error: message }, status)
}

// Parse URL and extract route parameters
function parseRoute(url) {
  const urlObj = new URL(url)
  const path = urlObj.pathname
  const parts = path.split('/').filter(p => p)
  
  return {
    path,
    parts,
    query: Object.fromEntries(urlObj.searchParams)
  }
}

// REST API route handler
async function handleAPIRequest(request) {
  const route = parseRoute(request.url)
  const method = request.method
  const { parts } = route

  try {
    // Ensure DB is initialized
    if (!db) await initDB()

    // Route: GET /api/tasks
    if (method === 'GET' && parts.length === 2 && parts[0] === 'api' && parts[1] === 'tasks') {
      const tasks = await getAllTasks()
      return sendJSONResponse(tasks)
    }

    // Route: GET /api/tasks/status/:status
    if (method === 'GET' && parts.length === 4 && parts[0] === 'api' && parts[1] === 'tasks' && parts[2] === 'status') {
      const status = parts[3]
      const tasks = await getTasksByStatus(status)
      return sendJSONResponse(tasks)
    }

    // Route: GET /api/tasks/:id
    if (method === 'GET' && parts.length === 3 && parts[0] === 'api' && parts[1] === 'tasks') {
      const id = parseInt(parts[2])
      if (isNaN(id)) {
        return sendErrorResponse('Invalid task ID', 400)
      }
      const task = await getTaskById(id)
      if (!task) {
        return sendErrorResponse('Task not found', 404)
      }
      return sendJSONResponse(task)
    }

    // Route: POST /api/tasks
    if (method === 'POST' && parts.length === 2 && parts[0] === 'api' && parts[1] === 'tasks') {
      const taskData = await request.json()
      const task = await createTask(taskData)
      return sendJSONResponse(task, 201)
    }

    // Route: PUT /api/tasks/:id
    if (method === 'PUT' && parts.length === 3 && parts[0] === 'api' && parts[1] === 'tasks') {
      const id = parseInt(parts[2])
      if (isNaN(id)) {
        return sendErrorResponse('Invalid task ID', 400)
      }
      const updates = await request.json()
      const task = await updateTask(id, updates)
      return sendJSONResponse(task)
    }

    // Route: DELETE /api/tasks/:id
    if (method === 'DELETE' && parts.length === 3 && parts[0] === 'api' && parts[1] === 'tasks') {
      const id = parseInt(parts[2])
      if (isNaN(id)) {
        return sendErrorResponse('Invalid task ID', 400)
      }
      await deleteTask(id)
      return sendJSONResponse({ message: 'Task deleted successfully' }, 200)
    }

    // Handle OPTIONS for CORS preflight
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

    // Route not found
    return sendErrorResponse('Route not found', 404)
  } catch (error) {
    console.error('API Error:', error)
    return sendErrorResponse(error.message || 'Internal server error', 500)
  }
}

// Handle skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Intercept fetch requests to /api/*
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  
  // Only handle requests to /api/*
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(event.request.clone()))
  }
  // For all other requests, use network first strategy
  else {
    event.respondWith(fetch(event.request))
  }
})

// Initialize DB on service worker installation
self.addEventListener('install', (event) => {
  // Skip waiting to activate immediately
  self.skipWaiting()
  event.waitUntil(initDB())
})

// Initialize DB on service worker activation
self.addEventListener('activate', async (event) => {
  // Claim all clients immediately
  event.waitUntil(
    Promise.all([
      initDB(),
      self.clients.claim()
    ])
  )
})
