<template>
  <div
    ref="cardElement"
    :draggable="!isTouchDevice"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    :class="[
      'task-card',
      isDragging ? 'opacity-50 scale-95' : 'opacity-100',
      isTouchDragging ? 'touch-dragging z-50' : '',
      deadlineCardClass
    ]"
    :style="touchDragStyle"
  >
    <div class="flex items-start justify-between mb-2">
      <h3 class="font-semibold text-gray-900 dark:text-white text-lg flex-1 flex items-center gap-2">
        <svg
          v-if="task.status === 'done'"
          class="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span>{{ task.title }}</span>
      </h3>
      <div class="flex items-center gap-2 ml-2">
        <button
          @click.stop="$emit('edit', task)"
          class="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          aria-label="Edit task"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          @click.stop="$emit('delete', task.id)"
          class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
          aria-label="Delete task"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
    <p v-if="task.description" class="text-gray-600 dark:text-gray-300 text-sm mb-3">
      {{ task.description }}
    </p>
    <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 flex-wrap gap-1">
      <span>{{ formatDate(task.createdAt) }}</span>
      <span v-if="effectiveDeadline" class="text-xs">
        Due {{ formatDate(effectiveDeadline) }}
      </span>
      <span
        :class="[
          'px-2 py-1 rounded-full text-xs font-medium',
          getPriorityClass(task.priority)
        ]"
      >
        {{ task.priority || 'Medium' }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getNextDeadlineFromRepeat, toDateString as toDateStringUtil } from '../utils/repeat.js'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['delete', 'edit'])

const isDragging = ref(false)
const isTouchDragging = ref(false)
const cardElement = ref(null)
const touchStartY = ref(0)
const touchStartX = ref(0)
const touchOffsetX = ref(0)
const touchOffsetY = ref(0)
const isTouchDevice = ref(false)
const touchDragStyle = ref({})
let touchStartTime = 0
let hasMoved = false

onMounted(() => {
  // Detect touch device
  isTouchDevice.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
})

const handleDragStart = (e) => {
  isDragging.value = true
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('taskId', props.task.id.toString())
}

const handleDragEnd = () => {
  isDragging.value = false
}

const handleTouchStart = (e) => {
  // Don't start drag if clicking on buttons
  if (e.target.closest('button')) {
    return
  }
  
  const touch = e.touches[0]
  const rect = cardElement.value.getBoundingClientRect()
  
  touchStartX.value = touch.clientX
  touchStartY.value = touch.clientY
  touchOffsetX.value = touch.clientX - rect.left - rect.width / 2
  touchOffsetY.value = touch.clientY - rect.top - rect.height / 2
  touchStartTime = Date.now()
  hasMoved = false
  
  // Prevent default to avoid scrolling
  e.preventDefault()
}

const handleTouchMove = (e) => {
  // Don't handle if clicking on buttons
  if (e.target.closest('button')) {
    return
  }
  
  const touch = e.touches[0]
  const moveX = Math.abs(touch.clientX - touchStartX.value)
  const moveY = Math.abs(touch.clientY - touchStartY.value)
  const timeElapsed = Date.now() - touchStartTime
  
  // Start dragging if moved more than 10px (reduced threshold since we prevent default)
  // Also check time to prevent immediate drags
  if (!isTouchDragging.value && (moveX > 10 || moveY > 10) && timeElapsed > 30) {
    isTouchDragging.value = true
    hasMoved = true
    // Dispatch custom event for global handling
    window.dispatchEvent(new CustomEvent('task-touch-drag-start', {
      detail: { taskId: props.task.id, element: cardElement.value }
    }))
  }
  
  // Always prevent default during potential drag to disable touch scrolling
  if (moveX > 5 || moveY > 5) {
    e.preventDefault()
    e.stopPropagation()
  }
  
  if (isTouchDragging.value) {
    const offsetX = touch.clientX - touchStartX.value
    const offsetY = touch.clientY - touchStartY.value
    
    touchDragStyle.value = {
      transform: `translate(${offsetX}px, ${offsetY}px) rotate(2deg)`,
      transition: 'none',
      position: 'fixed',
      left: `${touchStartX.value - touchOffsetX.value}px`,
      top: `${touchStartY.value - touchOffsetY.value}px`,
      width: `${cardElement.value.offsetWidth}px`,
      pointerEvents: 'none',
      zIndex: '1000'
    }
    
    // Dispatch move event with cursor position for scroll control
    window.dispatchEvent(new CustomEvent('task-touch-drag-move', {
      detail: { 
        taskId: props.task.id, 
        x: touch.clientX, 
        y: touch.clientY,
        element: cardElement.value
      }
    }))
    
    // Always prevent default to disable touch scrolling
    e.preventDefault()
    e.stopPropagation()
    return false
  }
}

const handleTouchEnd = (e) => {
  if (!isTouchDragging.value) return
  
  const touch = e.changedTouches[0]
  
  // Dispatch end event
  window.dispatchEvent(new CustomEvent('task-touch-drag-end', {
    detail: { 
      taskId: props.task.id, 
      x: touch.clientX, 
      y: touch.clientY,
      element: cardElement.value
    }
  }))
  
  // Reset after a short delay for smooth transition
  setTimeout(() => {
    isTouchDragging.value = false
    touchDragStyle.value = {}
    hasMoved = false
  }, 100)
  
  e.preventDefault()
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const getPriorityClass = (priority) => {
  const priorityMap = {
    Low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    High: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
  return priorityMap[priority] || priorityMap.Medium
}

/** Returns date-only string YYYY-MM-DD for a given date (local). */
function toDateString(date) {
  return toDateStringUtil(date)
}

/** When repeat + deadlineFromRepeat: next deadline from repeat; else task.deadline. */
const effectiveDeadline = computed(() => {
  const task = props.task
  if (task.repeat && task.deadlineFromRepeat) {
    return getNextDeadlineFromRepeat(task)
  }
  return task.deadline || null
})

/** deadlineState: '' | 'deadline-soon' (today/tomorrow) | 'deadline-overdue' (yesterday). Not applied when status is done. */
const deadlineCardClass = computed(() => {
  if (props.task.status === 'done') return ''
  const deadline = effectiveDeadline.value
  if (!deadline) return ''
  const deadlineDate = new Date(deadline)
  if (Number.isNaN(deadlineDate.getTime())) return ''
  const today = new Date()
  const todayStr = toDateString(today)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = toDateString(yesterday)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = toDateString(tomorrow)
  const deadlineStr = toDateString(deadlineDate)
  if (deadlineStr === yesterdayStr) return 'deadline-overdue'
  if (deadlineStr === todayStr || deadlineStr === tomorrowStr) return 'deadline-soon'
  return ''
})
</script>
