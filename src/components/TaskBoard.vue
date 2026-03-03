<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-lg font-bold text-gray-900 dark:text-white">Task Board</h2>
      <GradientButton
        label="+ Add Task"
        @click="showModal = true"
      />
    </div>

    <div 
      ref="scrollContainer"
      class="overflow-x-auto pb-4 -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-hide scroll-smooth"
    >
      <div class="flex flex-row gap-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 min-w-max md:min-w-0">
        <TaskColumn
          v-for="column in columns"
          :key="column.status"
          :title="column.title"
          :status="column.status"
          :tasks="getTasksByStatus(column.status)"
          @drop-task="handleTaskDrop"
          @delete-task="handleTaskDelete"
          @edit-task="handleTaskEdit"
        />
      </div>
    </div>

    <!-- Add/Edit Task Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeModal"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {{ isEditMode ? 'Edit Task' : 'Create New Task' }}
        </h3>
        <form @submit.prevent="isEditMode ? handleUpdateTask() : handleCreateTask()">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              v-model="newTask.title"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter task title"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              v-model="newTask.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter task description"
            ></textarea>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <select
              v-model="newTask.priority"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              v-model="newTask.status"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div class="flex gap-3">
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              {{ isEditMode ? 'Update Task' : 'Create Task' }}
            </button>
            <button
              type="button"
              @click="closeModal"
              class="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import TaskColumn from './TaskColumn.vue'
import GradientButton from '../common/GradientButton.vue'
import { taskDB } from '../utils/db.js'

const tasks = ref([])
const showModal = ref(false)
const isEditMode = ref(false)
const editingTaskId = ref(null)
const scrollContainer = ref(null)
const newTask = ref({
  title: '',
  description: '',
  priority: 'Medium',
  status: 'todo'
})

let autoScrollAnimationFrame = null
let verticalScrollAnimationFrame = null
let currentScrollDirection = 0
let currentVerticalScrollDirection = 0
let savedScrollY = 0
const SCROLL_THRESHOLD = 80 // Distance from edge to trigger scroll
const SCROLL_SPEED = 15 // Pixels to scroll per frame

const columns = [
  { title: 'To Do', status: 'todo' },
  { title: 'In Progress', status: 'in-progress' },
  { title: 'Review', status: 'review' },
  { title: 'Done', status: 'done' }
]

onMounted(async () => {
  await loadTasks()
  
  // Listen for touch drag events to enable auto-scrolling
  window.addEventListener('task-touch-drag-start', handleTouchDragStart)
  window.addEventListener('task-touch-drag-move', handleTouchDragMove)
  window.addEventListener('task-touch-drag-end', handleTouchDragEnd)
})

onUnmounted(() => {
  window.removeEventListener('task-touch-drag-start', handleTouchDragStart)
  window.removeEventListener('task-touch-drag-move', handleTouchDragMove)
  window.removeEventListener('task-touch-drag-end', handleTouchDragEnd)
  stopAutoScroll()
  restoreScrollContainer()
})

const loadTasks = async () => {
  try {
    tasks.value = await taskDB.getAllTasks()
  } catch (error) {
    console.error('Error loading tasks:', error)
  }
}

const getTasksByStatus = (status) => {
  return tasks.value.filter(task => task.status === status)
}

const handleTaskDrop = async (taskId, newStatus) => {
  try {
    await taskDB.updateTask(taskId, { status: newStatus })
    await loadTasks()
  } catch (error) {
    console.error('Error updating task:', error)
  }
}

const handleTaskDelete = async (taskId) => {
  if (confirm('Are you sure you want to delete this task?')) {
    try {
      await taskDB.deleteTask(taskId)
      await loadTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }
}

const handleTaskEdit = (task) => {
  editingTaskId.value = task.id
  isEditMode.value = true
  newTask.value = {
    title: task.title,
    description: task.description || '',
    priority: task.priority || 'Medium',
    status: task.status
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  isEditMode.value = false
  editingTaskId.value = null
  newTask.value = {
    title: '',
    description: '',
    priority: 'Medium',
    status: 'todo'
  }
}

const handleCreateTask = async () => {
  try {
    await taskDB.createTask({
      title: newTask.value.title,
      description: newTask.value.description,
      priority: newTask.value.priority,
      status: newTask.value.status
    })
    await loadTasks()
    closeModal()
  } catch (error) {
    console.error('Error creating task:', error)
  }
}

const handleUpdateTask = async () => {
  try {
    await taskDB.updateTask(editingTaskId.value, {
      title: newTask.value.title,
      description: newTask.value.description,
      priority: newTask.value.priority,
      status: newTask.value.status
    })
    await loadTasks()
    closeModal()
  } catch (error) {
    console.error('Error updating task:', error)
  }
}

const handleTouchDragStart = () => {
  // Disable touch scrolling on the container when dragging starts
  if (scrollContainer.value && window.innerWidth < 768) {
    scrollContainer.value.style.touchAction = 'none'
    // Save current scroll position and prevent body scroll
    savedScrollY = window.scrollY
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${savedScrollY}px`
    document.body.style.width = '100%'
  } else {
    // For desktop, still save scroll position for vertical scrolling
    savedScrollY = window.scrollY
  }
}

const handleTouchDragMove = (e) => {
  if (!scrollContainer.value) return
  
  const { x, y } = e.detail
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  // Calculate distance from edges of viewport
  const distanceFromLeft = x
  const distanceFromRight = viewportWidth - x
  const distanceFromTop = y
  const distanceFromBottom = viewportHeight - y
  
  // Check if we're on mobile (container is scrollable horizontally)
  const isMobile = window.innerWidth < 768
  
  // Stop any existing auto-scrolls
  stopAutoScroll()
  stopVerticalAutoScroll()
  
  // Horizontal scrolling (mobile only)
  if (isMobile) {
    // Auto-scroll left if near left edge of viewport
    if (distanceFromLeft < SCROLL_THRESHOLD && scrollContainer.value.scrollLeft > 0) {
      const proximity = 1 - (distanceFromLeft / SCROLL_THRESHOLD)
      const scrollAmount = proximity * SCROLL_SPEED
      startAutoScroll(-scrollAmount)
    }
    // Auto-scroll right if near right edge of viewport
    else if (distanceFromRight < SCROLL_THRESHOLD) {
      const maxScroll = scrollContainer.value.scrollWidth - scrollContainer.value.clientWidth
      if (scrollContainer.value.scrollLeft < maxScroll) {
        const proximity = 1 - (distanceFromRight / SCROLL_THRESHOLD)
        const scrollAmount = proximity * SCROLL_SPEED
        startAutoScroll(scrollAmount)
      }
    }
  }
  
  // Vertical scrolling (works on all devices)
  const isBodyFixed = document.body.style.position === 'fixed'
  const currentScrollY = isBodyFixed ? savedScrollY : window.scrollY
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight
  
  // Auto-scroll up if near top edge of viewport
  if (distanceFromTop < SCROLL_THRESHOLD && currentScrollY > 0) {
    const proximity = 1 - (distanceFromTop / SCROLL_THRESHOLD)
    const scrollAmount = proximity * SCROLL_SPEED
    startVerticalAutoScroll(-scrollAmount)
  }
  // Auto-scroll down if near bottom edge of viewport
  else if (distanceFromBottom < SCROLL_THRESHOLD && currentScrollY < maxScroll) {
    const proximity = 1 - (distanceFromBottom / SCROLL_THRESHOLD)
    const scrollAmount = proximity * SCROLL_SPEED
    startVerticalAutoScroll(scrollAmount)
  }
}

const handleTouchDragEnd = () => {
  stopAutoScroll()
  stopVerticalAutoScroll()
  restoreScrollContainer()
}

const restoreScrollContainer = () => {
  // Restore touch scrolling on the container when dragging ends
  if (scrollContainer.value) {
    scrollContainer.value.style.touchAction = ''
  }
  // Restore body scroll
  const isBodyFixed = document.body.style.position === 'fixed'
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.width = ''
  
  // Restore scroll position
  if (isBodyFixed && savedScrollY > 0) {
    window.scrollTo({
      top: savedScrollY,
      behavior: 'auto'
    })
  }
  
  // Reset saved scroll position
  savedScrollY = 0
}

const startAutoScroll = (direction) => {
  stopAutoScroll()
  currentScrollDirection = direction
  
  const scroll = () => {
    if (scrollContainer.value && currentScrollDirection !== 0) {
      const oldScrollLeft = scrollContainer.value.scrollLeft
      scrollContainer.value.scrollLeft += currentScrollDirection
      
      // Stop if we've reached the boundaries or scroll didn't change
      if (currentScrollDirection < 0 && scrollContainer.value.scrollLeft <= 0) {
        stopAutoScroll()
        return
      } else if (currentScrollDirection > 0) {
        const maxScroll = scrollContainer.value.scrollWidth - scrollContainer.value.clientWidth
        if (scrollContainer.value.scrollLeft >= maxScroll) {
          stopAutoScroll()
          return
        }
      }
      
      // Continue scrolling if position changed
      if (scrollContainer.value.scrollLeft !== oldScrollLeft) {
        autoScrollAnimationFrame = requestAnimationFrame(scroll)
      } else {
        stopAutoScroll()
      }
    }
  }
  
  autoScrollAnimationFrame = requestAnimationFrame(scroll)
}

const stopAutoScroll = () => {
  if (autoScrollAnimationFrame) {
    cancelAnimationFrame(autoScrollAnimationFrame)
    autoScrollAnimationFrame = null
  }
  currentScrollDirection = 0
}

const startVerticalAutoScroll = (direction) => {
  stopVerticalAutoScroll()
  currentVerticalScrollDirection = direction
  
  const scroll = () => {
    if (currentVerticalScrollDirection !== 0) {
      const isBodyFixed = document.body.style.position === 'fixed'
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      
      // Get current scroll position
      let currentScrollY = isBodyFixed ? savedScrollY : window.scrollY
      
      // Calculate new scroll position
      let newScrollY = currentScrollY + currentVerticalScrollDirection
      
      // Clamp to boundaries
      if (newScrollY < 0) {
        newScrollY = 0
      } else if (newScrollY > maxScroll) {
        newScrollY = maxScroll
      }
      
      // Only continue if we haven't reached boundaries
      if ((currentVerticalScrollDirection < 0 && newScrollY <= 0) || 
          (currentVerticalScrollDirection > 0 && newScrollY >= maxScroll)) {
        stopVerticalAutoScroll()
        return
      }
      
      // Update scroll position
      if (isBodyFixed) {
        // On mobile with fixed body, update saved position and body top
        savedScrollY = newScrollY
        document.body.style.top = `-${savedScrollY}px`
        // Also update document element scroll for visual feedback
        document.documentElement.scrollTop = newScrollY
        // Update window scroll position as well
        window.scrollTo(0, newScrollY)
      } else {
        // On desktop, use normal scrolling
        window.scrollTo({
          top: newScrollY,
          behavior: 'auto'
        })
      }
      
      // Continue scrolling
      verticalScrollAnimationFrame = requestAnimationFrame(scroll)
    }
  }
  
  verticalScrollAnimationFrame = requestAnimationFrame(scroll)
}

const stopVerticalAutoScroll = () => {
  if (verticalScrollAnimationFrame) {
    cancelAnimationFrame(verticalScrollAnimationFrame)
    verticalScrollAnimationFrame = null
  }
  currentVerticalScrollDirection = 0
}
</script>
