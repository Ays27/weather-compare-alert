<template>
  <div v-if="notifications.length > 0" class="space-y-3">
    <div
      v-for="notification in notifications"
      :key="notification.type"
      :class="[
        'flex items-start gap-3 rounded-lg p-4 border',
        notificationStyles[notification.type],
      ]"
    >
      <span :class="['text-xl flex-shrink-0', iconMap[notification.type]]">
        {{ iconMap[notification.type] }}
      </span>
      <p class="text-sm font-medium flex-1">{{ notification.message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Notification } from '~/composables/useWeather'

defineProps<{
  notifications: Notification[]
}>()

const iconMap: Record<string, string> = {
  hot: '🌡️',
  cold: '🥶',
  rain: '🌧️',
}

const notificationStyles: Record<string, string> = {
  hot: 'bg-orange-50 border-orange-200 text-orange-900',
  cold: 'bg-blue-50 border-blue-200 text-blue-900',
  rain: 'bg-cyan-50 border-cyan-200 text-cyan-900',
}
</script>
