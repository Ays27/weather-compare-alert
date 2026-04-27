<template>
  <div class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
    <p class="mb-4 text-sm font-medium text-slate-500 uppercase tracking-wide">{{ label }}</p>
    <div class="flex items-center justify-between">
      <div>
        <p class="text-4xl font-bold text-slate-900">{{ weather.temp }}°C</p>
        <p class="mt-2 text-slate-600">{{ weather.description }}</p>
        <p class="mt-1 text-sm text-slate-500">Humidity: {{ weather.humidity }}%</p>
      </div>
      <div class="text-6xl">{{ weather.icon }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WeatherData } from '~/composables/useWeather'

defineProps<{
  label: string
  weather: WeatherData
}>()
</script>
