<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <!-- Header -->
    <header class="border-b border-slate-200 bg-white shadow-sm">
      <div class="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-slate-900">Weather Comparison</h1>
        <p class="mt-2 text-slate-600">Compare today's weather with tomorrow's forecast</p>
      </div>
    </header>

    <!-- Main Content -->
    <main class="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <!-- Location Input -->
      <div class="mb-8 rounded-lg bg-white p-6 shadow-sm">
        <label class="block mb-4">
          <span class="mb-2 block text-sm font-medium text-slate-700">Enter City Name</span>
          <input
            v-model="cityName"
            type="text"
            placeholder="e.g., London, New York, Tokyo"
            class="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            @keyup.enter="fetchWeather"
          />
        </label>
        <button
          @click="fetchWeather"
          :disabled="loading || !cityName.trim()"
          class="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          <span v-if="!loading">Get Weather</span>
          <span v-else>Loading...</span>
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        {{ error }}
      </div>

      <!-- Weather Cards -->
      <div v-if="comparisonResult && !loading" class="space-y-6">
        <!-- Notifications -->
        <Notifications :notifications="comparisonResult.notifications" />

        <!-- Comparison Message -->
        <ComparisonMessage :result="comparisonResult" />

        <!-- Weather Cards Grid -->
        <div class="grid gap-6 md:grid-cols-2">
          <WeatherCard label="Today" :weather="comparisonResult.today" />
          <WeatherCard label="Tomorrow" :weather="comparisonResult.tomorrow" />
        </div>

        <!-- Additional Info -->
        <div class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="mb-4 text-lg font-semibold text-slate-900">Details</h2>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-600">Temperature Difference</span>
              <span class="font-medium text-slate-900">{{ comparisonResult.tempDifference > 0 ? '+' : '' }}{{ comparisonResult.tempDifference }}°C</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">Humidity Change (Today → Tomorrow)</span>
              <span class="font-medium text-slate-900">{{ comparisonResult.today.humidity }}% → {{ comparisonResult.tomorrow.humidity }}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">Condition Change</span>
              <span class="font-medium text-slate-900">{{ comparisonResult.today.description }} → {{ comparisonResult.tomorrow.description }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading" class="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
        <div class="text-5xl mb-4">🌤️</div>
        <h3 class="mb-2 text-lg font-semibold text-slate-900">Enter a city to get started</h3>
        <p class="text-slate-600">Search for any city to compare today's and tomorrow's weather</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHead } from '#app'
import type { ComparisonResult } from '~/composables/useWeather'
import { useWeather } from '~/composables/useWeather'
import WeatherCard from '~/components/WeatherCard.vue'
import ComparisonMessage from '~/components/ComparisonMessage.vue'
import Notifications from '~/components/Notifications.vue'

const { fetchWeatherData } = useWeather()

const cityName = ref('')
const loading = ref(false)
const error = ref('')
const comparisonResult = ref<ComparisonResult | null>(null)

const fetchWeather = async () => {
  error.value = ''
  comparisonResult.value = null
  loading.value = true

  try {
    if (!cityName.value.trim()) {
      error.value = 'Please enter a city name'
      loading.value = false
      return
    }

    // Geocode city name to coordinates using Nominatim (free service)
    const geoResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName.value)}&limit=1`
    )

    if (!geoResponse.ok) {
      throw new Error('Could not find city')
    }

    const geoData = await geoResponse.json()

    if (!geoData || geoData.length === 0) {
      error.value = `City "${cityName.value}" not found. Please try another city.`
      loading.value = false
      return
    }

    const { lat, lon } = geoData[0]

    // Fetch weather for the coordinates
    comparisonResult.value = await fetchWeatherData(parseFloat(lat), parseFloat(lon))
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch weather data'
  } finally {
    loading.value = false
  }
}

// Use Page Meta for SEO
useHead({
  title: 'Weather Comparison - Today vs Tomorrow',
  meta: [
    {
      name: 'description',
      content: 'Compare today and tomorrow weather forecasts. Get instant temperature, humidity, and weather condition comparisons.',
    },
    {
      property: 'og:title',
      content: 'Weather Comparison App',
    },
    {
      property: 'og:description',
      content: 'Compare weather conditions between today and tomorrow',
    },
  ],
})
</script>
