// REST API client for Task Manager
const API_BASE_URL = '/api/tasks'

// Helper function to ensure service worker is ready
async function ensureServiceWorkerReady() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready
      // Check if service worker is actually controlling the page
      if (navigator.serviceWorker.controller) {
        // Give service worker a moment to be fully ready
        await new Promise(resolve => setTimeout(resolve, 50))
        return registration
      } else {
        console.warn('Service Worker registered but not controlling the page. Reload may be needed.')
        // Wait a bit longer for service worker to take control
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    } catch (error) {
      console.warn('Service Worker not ready:', error)
    }
  }
  return null
}

// Helper function to handle API responses
async function handleResponse(response) {
  const contentType = response.headers.get('content-type')
  
  // Check if response is actually JSON
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text()
    // If we got HTML, the service worker didn't intercept
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      console.error('Service Worker not intercepting. Response was HTML:', text.substring(0, 200))
      throw new Error('Service Worker not intercepting requests. Please refresh the page and ensure the service worker is active.')
    }
    throw new Error(`Expected JSON but got ${contentType}. Response: ${text.substring(0, 100)}`)
  }
  
  if (!response.ok) {
    try {
      const error = await response.json()
      throw new Error(error.error || `HTTP error! status: ${response.status}`)
    } catch (e) {
      if (e.message.includes('HTTP error')) {
        throw e
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  }
  
  try {
    return await response.json()
  } catch (e) {
    const text = await response.text()
    throw new Error(`Failed to parse JSON response: ${text.substring(0, 100)}`)
  }
}

// REST API wrapper class
class TaskDB {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  // GET /api/tasks - Get all tasks
  async getAllTasks() {
    await ensureServiceWorkerReady()
    const response = await fetch(this.baseURL, {
      cache: 'no-store'
    })
    return handleResponse(response)
  }

  // GET /api/tasks/status/:status - Get tasks by status
  async getTasksByStatus(status) {
    await ensureServiceWorkerReady()
    const response = await fetch(`${this.baseURL}/status/${encodeURIComponent(status)}`, {
      cache: 'no-store'
    })
    return handleResponse(response)
  }

  // GET /api/tasks/:id - Get task by ID
  async getTaskById(id) {
    await ensureServiceWorkerReady()
    const response = await fetch(`${this.baseURL}/${id}`, {
      cache: 'no-store'
    })
    return handleResponse(response)
  }

  // POST /api/tasks - Create a new task
  async createTask(task) {
    await ensureServiceWorkerReady()
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(task),
      cache: 'no-store'
    })
    return handleResponse(response)
  }

  // PUT /api/tasks/:id - Update a task
  async updateTask(id, updates) {
    await ensureServiceWorkerReady()
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates),
      cache: 'no-store'
    })
    return handleResponse(response)
  }

  // DELETE /api/tasks/:id - Delete a task
  async deleteTask(id) {
    await ensureServiceWorkerReady()
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'DELETE',
      cache: 'no-store'
    })
    return handleResponse(response)
  }
}

export const taskDB = new TaskDB()
