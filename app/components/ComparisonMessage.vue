<template>
  <div class="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 shadow-sm">
    <div class="flex items-center gap-3">
      <div class="text-3xl">{{ comparisonEmoji }}</div>
      <div>
        <p class="text-lg font-semibold text-slate-900">{{ message }}</p>
        <p class="mt-1 text-sm text-slate-600">Temperature difference: {{ difference > 0 ? '+' : '' }}{{ difference }}°C</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComparisonResult } from '~/composables/useWeather'

const props = defineProps<{
  result: ComparisonResult
}>()

const comparisonEmoji = computed(() => {
  if (props.result.comparison === 'hotter') return '🔥'
  if (props.result.comparison === 'colder') return '❄️'
  return '🌡️'
})

const message = computed(() => props.result.message)
const difference = computed(() => props.result.tempDifference)
</script>
