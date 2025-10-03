import userManager from '../auth/authService.js'

import { API_BASE_URL, API_BASE } from '../config.js'

console.log('API_BASE configurado para:', API_BASE)

async function apiFetch(url, options = {}) {
  try {
    const response = await fetch(url, options)
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error en petición:', errorText)
      throw new Error(`Error HTTP: ${response.status} ${response.statusText}`)
    }
    const result = await response.json()
    return result
  } catch (error) {
    console.error(`❌ Error al hacer la petición a ${url}:`, error)
    throw error
  }
}

async function apiFetchAuth(url, options = {}) {
  try {
    const user = await userManager.getUser()
    if (user && user.access_token) {
      const headers = {
        Authorization: `Bearer ${user.access_token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      }

      const requestOptions = {
        ...options,
        headers,
      }

      const response = await fetch(url, requestOptions)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Respuesta de error:', errorText)
        throw new Error(`Error HTTP: ${response.status} - ${errorText}`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text()
        console.error('❌ Respuesta no es JSON:', textResponse)
      }

      const result = await response.json()
      return result
    } else {
      throw new Error('Usuario no autenticado')
    }
  } catch (error) {
    console.error('❌ Error completo en apiFetchAuth:', error)
    throw error
  }
}

export async function getRutas() {
  const url = `${API_BASE}/rutas/routes`
  return await apiFetch(url)
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
  throw new Error('No se encontraron coordenadas para ' + lugar)
}

export async function trazarRuta(origen, destino) {
  const url = `${API_BASE}/ors/directions?startLng=${origen.lng}&startLat=${origen.lat}&endLng=${destino.lng}&endLat=${destino.lat}`
  const data = await apiFetch(url)
  const coords = data.features[0].geometry.coordinates.map((c) => [c[1], c[0]])
  return coords
}

export async function fetchAutocomplete(query) {
  if (!query) return []
  const url = `${API_BASE}/rutas/autocomplete?query=${encodeURIComponent(query)}`
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

export async function crearNuevaRuta(rutaGeoJSON, paradasGeoJSON) {
  const url = `${API_BASE}/rutas/crearRuta`
  const body = {
    rutaGeoJSON,
    paradasGeoJSON,
  }

  return await apiFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

export async function eliminarRuta(id) {
  const url = `${API_BASE}/rutas/eliminarRuta/${id}`
  return await apiFetch(url, {
    method: 'DELETE',
  })
}

export async function crearUsuario(perfil) {
  const url = `${API_BASE}/user/crearUsuario`
  return await apiFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(perfil),
  })
}

export async function getMisDatos() {
  const url = `${API_BASE}/rutas/usuarios/perfil`
  return await apiFetchAuth(url)
}

export async function agregarFavorito(rutaId) {
  const url = `${API_BASE}/user/favoritos`

  try {
    const response = await apiFetchAuth(url, {
      method: 'PUT',
      body: JSON.stringify({ rutaId: rutaId }),
    })
    return response
  } catch (error) {
    console.error('❌ Error en agregarFavorito:', error.message)
    throw error
  }
}

export async function quitarFavorito(rutaId) {
  const url = `${API_BASE}/user/favoritos/${rutaId}`
  return await apiFetchAuth(url, {
    method: 'DELETE',
  })
}

export async function obtenerFavoritos() {
  const url = `${API_BASE}/user/favoritos`
  return await apiFetchAuth(url, {
    method: 'GET',
  })
}
