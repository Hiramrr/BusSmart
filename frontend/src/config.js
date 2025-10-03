// URL del backend según el entorno
export const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:3000'
  : 'https://bussmart.onrender.com'

export const API_BASE = `${API_BASE_URL}/api`

// Función para construir URLs de imágenes
export function getImageUrl(imagePath) {
  // Validar que imagePath existe y es un string
  if (!imagePath || typeof imagePath !== 'string') {
    console.warn('⚠️ getImageUrl recibió un valor inválido:', imagePath)
    return ''
  }

  // Si ya es una URL completa
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  // Limpiar prefijos duplicados
  const cleanPath = imagePath
    .replace(/^\/images\//, '')
    .replace(/^images\//, '')
    .replace(/^\//, '')

  return `${API_BASE_URL}/images/${cleanPath}`
}
