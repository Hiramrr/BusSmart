import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useMapSelection = defineStore('mapSelection', () => {
  const selecting = ref(false)
  const selectedPoint = ref(null) // { lat, lng }

  function startSelecting() {
    selecting.value = true
    selectedPoint.value = null
  }

  function stopSelecting() {
    selecting.value = false
  }

  function setPoint(lat, lng) {
    selectedPoint.value = { lat: Number(lat), lng: Number(lng) }
    selecting.value = false
  }

  function clearPoint() {
    selectedPoint.value = null
  }

  return {
    selecting,
    selectedPoint,
    startSelecting,
    stopSelecting,
    setPoint,
    clearPoint,
  }
})
