export interface WeatherData {
  temp: number
  humidity: number
  description: string
  icon: string
}

export interface Notification {
  type: 'hot' | 'cold' | 'rain'
  message: string
}

export interface ComparisonResult {
  today: WeatherData
  tomorrow: WeatherData
  tempDifference: number
  comparison: 'hotter' | 'colder' | 'same'
  message: string
  notifications: Notification[]
}

export const useWeather = () => {
  const getWeatherEmoji = (iconCode: string): string => {
    const iconMap: Record<string, string> = {
      '01d': '☀️',
      '01n': '🌙',
      '02d': '⛅',
      '02n': '🌙',
      '03d': '☁️',
      '03n': '☁️',
      '04d': '☁️',
      '04n': '☁️',
      '09d': '🌧️',
      '09n': '🌧️',
      '10d': '🌧️',
      '10n': '🌧️',
      '11d': '⛈️',
      '11n': '⛈️',
      '13d': '❄️',
      '13n': '❄️',
      '50d': '🌫️',
      '50n': '🌫️',
    }
    return iconMap[iconCode] || '🌡️'
  }

  const fetchWeatherData = async (lat: number, lon: number): Promise<ComparisonResult> => {
    try {
      // Use OpenWeatherMap API (requires API key)
      // For demo, we'll use a public endpoint
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weather_code,relative_humidity_2m_max&temperature_unit=celsius&timezone=auto`
      )

      if (!response.ok) throw new Error('Failed to fetch weather')

      const data = await response.json()
      const dailyData = data.daily

      // Get today and tomorrow data
      const todayTemp = (dailyData.temperature_2m_max[0] + dailyData.temperature_2m_min[0]) / 2
      const tomorrowTemp = (dailyData.temperature_2m_max[1] + dailyData.temperature_2m_min[1]) / 2
      const todayHumidity = dailyData.relative_humidity_2m_max[0]
      const tomorrowHumidity = dailyData.relative_humidity_2m_max[1]

      // Get WMO weather codes and convert to icons
      const todayCode = dailyData.weather_code[0]
      const tomorrowCode = dailyData.weather_code[1]

      const todayIcon = getWeatherEmoji(convertWMOtoIcon(todayCode))
      const tomorrowIcon = getWeatherEmoji(convertWMOtoIcon(tomorrowCode))

      const tempDifference = Math.round((tomorrowTemp - todayTemp) * 10) / 10
      let comparison: 'hotter' | 'colder' | 'same'

      if (tempDifference > 0.5) {
        comparison = 'hotter'
      } else if (tempDifference < -0.5) {
        comparison = 'colder'
      } else {
        comparison = 'same'
      }

      const today: WeatherData = {
        temp: Math.round(todayTemp * 10) / 10,
        humidity: todayHumidity,
        description: getWeatherDescription(todayCode),
        icon: todayIcon,
      }

      const tomorrow: WeatherData = {
        temp: Math.round(tomorrowTemp * 10) / 10,
        humidity: tomorrowHumidity,
        description: getWeatherDescription(tomorrowCode),
        icon: tomorrowIcon,
      }

      const message = generateComparisonMessage(today, tomorrow, comparison, tempDifference)
      const notifications = generateNotifications(today, tomorrow, tempDifference)

      return {
        today,
        tomorrow,
        tempDifference,
        comparison,
        message,
        notifications,
      }
    } catch (error) {
      throw new Error('Unable to fetch weather data')
    }
  }

  const convertWMOtoIcon = (code: number): string => {
    // WMO Weather interpretation codes
    if (code === 0) return '01d'
    if (code === 1 || code === 2) return '02d'
    if (code === 3) return '03d'
    if (code === 45 || code === 48) return '50d'
    if (code === 51 || code === 53 || code === 55 || code === 61 || code === 63 || code === 65)
      return '09d'
    if (code === 71 || code === 73 || code === 75 || code === 77 || code === 80 || code === 81 || code === 82)
      return '13d'
    if (code === 85 || code === 86) return '13d'
    if (code === 80 || code === 81 || code === 82) return '10d'
    if (code === 95 || code === 96 || code === 99) return '11d'
    return '04d'
  }

  const getWeatherDescription = (code: number): string => {
    if (code === 0) return 'Clear sky'
    if (code === 1 || code === 2) return 'Mostly clear'
    if (code === 3) return 'Overcast'
    if (code === 45 || code === 48) return 'Foggy'
    if (code === 51 || code === 53 || code === 55) return 'Drizzle'
    if (code === 61 || code === 63 || code === 65) return 'Rain'
    if (code === 71 || code === 73 || code === 75) return 'Snow'
    if (code === 77) return 'Snow grains'
    if (code === 80 || code === 81 || code === 82) return 'Rain showers'
    if (code === 85 || code === 86) return 'Snow showers'
    if (code === 95 || code === 96 || code === 99) return 'Thunderstorm'
    return 'Unknown'
  }

  const generateComparisonMessage = (
    today: WeatherData,
    tomorrow: WeatherData,
    comparison: string,
    difference: number
  ): string => {
    const absDiff = Math.abs(difference)

    if (comparison === 'hotter') {
      if (absDiff > 5) return `Significantly hotter tomorrow (+${absDiff.toFixed(1)}°C)`
      return `Warmer tomorrow (+${absDiff.toFixed(1)}°C)`
    }

    if (comparison === 'colder') {
      if (absDiff > 5) return `Significantly colder tomorrow (-${absDiff.toFixed(1)}°C)`
      return `Cooler tomorrow (-${absDiff.toFixed(1)}°C)`
    }

    return 'About the same tomorrow'
  }

  const generateNotifications = (
    today: WeatherData,
    tomorrow: WeatherData,
    tempDifference: number
  ): Notification[] => {
    const notifications: Notification[] = []

    // Check if tomorrow will be too hot (>30°C)
    if (tomorrow.temp > 30) {
      notifications.push({
        type: 'hot',
        message: `It will be very hot tomorrow (${tomorrow.temp}°C). Stay hydrated!`,
      })
    }

    // Check if tomorrow will be too cold (<0°C)
    if (tomorrow.temp < 0) {
      notifications.push({
        type: 'cold',
        message: `It will be freezing tomorrow (${tomorrow.temp}°C). Bundle up!`,
      })
    }

    // Check if it will rain tomorrow (rain-related codes)
    const rainCodes = [51, 53, 55, 61, 63, 65, 71, 73, 75, 80, 81, 82, 85, 86, 95, 96, 99]
    if (tomorrow.description.toLowerCase().includes('rain') || 
        tomorrow.description.toLowerCase().includes('drizzle') ||
        tomorrow.description.toLowerCase().includes('showers') ||
        tomorrow.description.toLowerCase().includes('thunderstorm')) {
      notifications.push({
        type: 'rain',
        message: `Rain expected tomorrow. Bring an umbrella!`,
      })
    }

    return notifications
  }

  return {
    fetchWeatherData,
    generateNotifications,
  }
}
