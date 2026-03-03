<template>
  <div
    ref="columnElement"
    class="column"
    @drop="handleDrop"
    @dragover.prevent
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    :class="[
      isDragOver || isTouchDragOver ? 'drag-over' : ''
    ]"
  >
    <div class="column-header flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span>{{ title }}</span>
        <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
          ({{ sortedTasks.length }})
        </span>
      </div>
    </div>
    <div
      :class="[
        'min-h-[500px] transition-colors duration-200',
        isDragOver ? 'bg-gray-100 dark:bg-gray-800' : ''
      ]"
    >
      <TaskCard
        v-for="task in sortedTasks"
        :key="task.id"
        :task="task"
        @delete="$emit('delete-task', task.id)"
        @edit="$emit('edit-task', task)"
      />
      <div
        v-if="sortedTasks.length === 0"
        class="text-center text-gray-400 dark:text-gray-500 py-8"
      >
        No tasks
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import TaskCard from './TaskCard.vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  tasks: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['drop-task', 'delete-task', 'edit-task'])

// Priority order: High = 3, Medium = 2, Low = 1
const getPriorityValue = (priority) => {
  const priorityMap = {
    'High': 3,
    'Medium': 2,
    'Low': 1
  }
  return priorityMap[priority] || 2 // Default to Medium if priority is not set
}

// Sort tasks by priority (High > Medium > Low), then by createdAt (newest first)
const sortedTasks = computed(() => {
  return [...props.tasks].sort((a, b) => {
    // First, sort by priority (descending: High > Medium > Low)
    const priorityA = getPriorityValue(a.priority)
    const priorityB = getPriorityValue(b.priority)
    
    if (priorityA !== priorityB) {
      return priorityB - priorityA // Higher priority first
    }
    
    // If priorities are equal, sort by createdAt (newest first)
    const dateA = new Date(a.createdAt || 0)
    const dateB = new Date(b.createdAt || 0)
    return dateB - dateA // Newer dates first
  })
})

const isDragOver = ref(false)
const isTouchDragOver = ref(false)
const columnElement = ref(null)
let activeTouchDrag = null

onMounted(() => {
  // Listen for touch drag events
  window.addEventListener('task-touch-drag-start', handleTouchDragStart)
  window.addEventListener('task-touch-drag-move', handleTouchDragMove)
  window.addEventListener('task-touch-drag-end', handleTouchDragEnd)
})

onUnmounted(() => {
  window.removeEventListener('task-touch-drag-start', handleTouchDragStart)
  window.removeEventListener('task-touch-drag-move', handleTouchDragMove)
  window.removeEventListener('task-touch-drag-end', handleTouchDragEnd)
})

const handleDragEnter = (e) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (e) => {
  // Only set to false if we're actually leaving the column
  if (!columnElement.value.contains(e.relatedTarget)) {
    isDragOver.value = false
  }
}

const handleDrop = (e) => {
  e.preventDefault()
  isDragOver.value = false
  const taskId = parseInt(e.dataTransfer.getData('taskId'))
  if (taskId) {
    emit('drop-task', taskId, props.status)
  }
}

const handleTouchDragStart = (e) => {
  activeTouchDrag = e.detail
}

const handleTouchDragMove = (e) => {
  if (!activeTouchDrag) return
  
  const { x, y } = e.detail
  if (columnElement.value) {
    const rect = columnElement.value.getBoundingClientRect()
    const isOver = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    
    if (isOver && !isTouchDragOver.value) {
      isTouchDragOver.value = true
    } else if (!isOver && isTouchDragOver.value) {
      isTouchDragOver.value = false
    }
  }
}

const handleTouchDragEnd = (e) => {
  if (!activeTouchDrag) return
  
  const { x, y, taskId } = e.detail
  if (columnElement.value) {
    const rect = columnElement.value.getBoundingClientRect()
    const isOver = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    
    if (isOver && taskId) {
      emit('drop-task', taskId, props.status)
    }
  }
  
  isTouchDragOver.value = false
  activeTouchDrag = null
}

const handleTouchMove = (e) => {
  // If there's an active touch drag, prevent default scrolling
  if (activeTouchDrag) {
    e.preventDefault()
    e.stopPropagation()
  }
}

const handleTouchEnd = (e) => {
  // If there's an active touch drag, prevent default
  if (activeTouchDrag) {
    e.preventDefault()
    e.stopPropagation()
  }
}
</script>
