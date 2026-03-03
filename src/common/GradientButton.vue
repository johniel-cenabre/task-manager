<template>
  <button
    ref="buttonRef"
    :type="type"
    :disabled="disabled"
    :class="[
      'gradient-button relative overflow-hidden',
      sizeClasses,
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      customClass
    ]"
    @click="handleClick"
  >
    <span class="relative z-10">{{ label }}</span>
    <span
      v-if="ripple"
      ref="rippleRef"
      class="ripple"
      :style="rippleStyle"
    ></span>
  </button>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'button'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  customClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['click'])

const buttonRef = ref(null)
const rippleRef = ref(null)
const ripple = ref(false)
const rippleStyle = ref({})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }
  return sizes[props.size]
})

const handleClick = (event) => {
  if (props.disabled) return

  // Create ripple effect
  if (buttonRef.value) {
    const rect = buttonRef.value.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2

    rippleStyle.value = {
      width: `${size}px`,
      height: `${size}px`,
      left: `${x}px`,
      top: `${y}px`
    }

    ripple.value = true

    // Remove ripple after animation
    setTimeout(() => {
      ripple.value = false
    }, 600)
  }

  emit('click', event)
}
</script>

<style scoped>
.gradient-button {
  @apply font-medium transition-all duration-200 shadow-md hover:shadow-lg;
  @apply bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700;
  @apply hover:from-primary-600 hover:via-primary-700 hover:to-primary-800;
  @apply text-white rounded-3xl;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
  @apply active:scale-95;
}

.gradient-button:disabled {
  @apply hover:shadow-md;
}

.ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  transform: scale(0);
  animation: ripple-animation 0.6s ease-out;
  pointer-events: none;
}

@keyframes ripple-animation {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
</style>
