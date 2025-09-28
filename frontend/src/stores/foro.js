import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useForoStore = defineStore('foro', () => {
  const reportes = ref([])
  const loading = ref(false)
  const error = ref(null)

  const getApiBase = () => {
    return import.meta.env.DEV ? 'http://localhost:3000/api' : 'https://bussmart.onrender.com/api'
  }

  async function cargarReportes() {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${getApiBase()}/foro/reportes`)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const reportesData = await response.json()
      reportes.value = reportesData
    } catch (err) {
      console.error('Error al cargar reportes:', err)
      error.value = 'Error al cargar los reportes. Por favor, intenta de nuevo.'
    } finally {
      loading.value = false
    }
  }

  async function agregarReporte(reporte) {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${getApiBase()}/foro/reportes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reporte),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al enviar reporte')
      }

      const nuevoReporte = await response.json()

      // Agregar al inicio de la lista
      reportes.value.unshift(nuevoReporte)

      return nuevoReporte
    } catch (err) {
      console.error('Error al agregar reporte:', err)
      error.value = err.message || 'Error al enviar el reporte. Por favor, intenta de nuevo.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function cargarReportesRecientes() {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`${getApiBase()}/foro/reportes/recientes`)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const reportesData = await response.json()
      reportes.value = reportesData
    } catch (err) {
      console.error('Error al cargar reportes recientes:', err)
      error.value = 'Error al cargar los reportes recientes.'
    } finally {
      loading.value = false
    }
  }

  function limpiarError() {
    error.value = null
  }

  return {
    reportes,
    loading,
    error,
    agregarReporte,
    cargarReportes,
    cargarReportesRecientes,
    limpiarError,
  }
})
