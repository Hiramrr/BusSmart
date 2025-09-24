import userManager from '../auth/authService.js'

// Obtener todas las rutas desde /routes
export async function getRutas() {
  const url = `${API_BASE}/rutas/routes`
  return await apiFetch(url)
}
// Esto funciona para desarrollo local. Para producción, se configurará diferente.
const API_BASE = 'http://localhost:3000/api'

async function apiFetch(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      // Si la respuesta del servidor es un error (4xx, 5xx), lo capturamos.
      throw new Error(`Error HTTP: ${response.status} ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error al hacer la petición a ${url}:`, error)
    // Relanzamos el error para que el componente que llama pueda manejarlo.
    throw error
  }
}

export async function getCoords(lugar) {
  const url = `${API_BASE}/ors/geocode?text=${encodeURIComponent(lugar)}`
  const data = await apiFetch(url)

  if (data.features && data.features.length > 0) {
    return {
      lat: data.features[0].geometry.coordinates[1],
      lng: data.features[0].geometry.coordinates[0],
    }
  }
  // Si no hay resultados, lanzamos un error claro.
  throw new Error('No se encontraron coordenadas para ' + lugar)
}

export async function trazarRuta(origen, destino) {
  const url = `${API_BASE}/ors/directions?startLng=${origen.lng}&startLat=${origen.lat}&endLng=${destino.lng}&endLat=${destino.lat}`
  const data = await apiFetch(url)

  // Procesamos los datos para devolverlos en el formato que Leaflet espera [lat, lng].
  const coords = data.features[0].geometry.coordinates.map((c) => [c[1], c[0]])
  return coords
}

export async function fetchAutocomplete(query) {
  if (!query) return []
  const url = `${API_BASE}/rutas/autocomplete?query=${encodeURIComponent(query)}`
  // Reutilizamos nuestra función apiFetch para mantener el código DRY.
  return await apiFetch(url)
}

export async function fetchRutaPorId(id) {
  const url = `${API_BASE}/rutas/${id}`
  return await apiFetch(url)
}

export async function fetchSugerenciasDeRuta(origen, destino) {
  const url = `${API_BASE}/rutas/sugerir?latOrigen=${origen.lat}&lngOrigen=${origen.lng}&latDestino=${destino.lat}&lngDestino=${destino.lng}`
  return await apiFetch(url)
}

export async function crearUsuario(perfil) {
  const url = `${API_BASE}/user/crearUsuario`

  return await apiFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(perfil),
  })
}

// Función para hacer peticiones autenticadas
async function apiFetchAuth(url, options = {}) {
  const user = await userManager.getUser()

  if (user && user.access_token) {
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${user.access_token}`,
      'Content-Type': 'application/json',
    }
    return await apiFetch(url, { ...options, headers })
  } else {
    throw new Error('Usuario no autenticado. No se puede realizar la petición.')
  }
}

export async function getMisDatos() {
  const url = `${API_BASE}/rutas//usuarios/perfil`
  return await apiFetchAuth(url)
}

// Agrega una ruta favorita
export async function agregarFavorito(rutaId) {
  const url = `${API_BASE}/rutas//favoritos`
  return await apiFetchAuth(url, {
    method: 'PUT',
    body: JSON.stringify({ rutaId: rutaId }),
  })
}

export async function quitarFavorito(rutaId) {
  const url = `${API_BASE}/rutas//favoritos/${rutaId}`
  return await apiFetchAuth(url, {
    method: 'DELETE',
  })
}
