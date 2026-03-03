<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 transition-colors duration-200">
    <Header />
    <TaskBoard />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import Header from './common/Header.vue'
import TaskBoard from './components/TaskBoard.vue'
import { theme } from './utils/theme.js'

onMounted(() => {
  theme.init()
})
</script>
