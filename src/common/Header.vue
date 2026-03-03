<template>
  <header class="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-800/90 dark:to-gray-900 shadow-sm border-b border-blue-200/50 dark:border-gray-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">
          Task Manager
        </h1>
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>

<script setup>
import ThemeToggle from './ThemeToggle.vue'
</script>
