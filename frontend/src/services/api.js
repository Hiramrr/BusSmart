// Gracias al proxy de Vite, solo necesitamos la ruta relativa.
// Esto funciona para desarrollo local. Para producción, se configurará diferente.
const API_BASE = '/api';

async function apiFetch(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      // Si la respuesta del servidor es un error (4xx, 5xx), lo capturamos.
      throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error al hacer la petición a ${url}:`, error);
    // Relanzamos el error para que el componente que llama pueda manejarlo.
    throw error;
  }
}

export async function getCoords(lugar) {
  const url = `${API_BASE}/ors/geocode?text=${encodeURIComponent(lugar)}`;
  const data = await apiFetch(url);

  if (data.features && data.features.length > 0) {
    return { 
      lat: data.features[0].geometry.coordinates[1],
      lng: data.features[0].geometry.coordinates[0],
    };
  }
  // Si no hay resultados, lanzamos un error claro.
  throw new Error("No se encontraron coordenadas para " + lugar);
}

export async function trazarRuta(origen, destino) {
  const url = `${API_BASE}/ors/directions?startLng=${origen.lng}&startLat=${origen.lat}&endLng=${destino.lng}&endLat=${destino.lat}`;
  const data = await apiFetch(url);

  // Procesamos los datos para devolverlos en el formato que Leaflet espera [lat, lng].
  const coords = data.features[0].geometry.coordinates.map(c => [c[1], c[0]]);
  return coords; 
}

export async function fetchAutocomplete(query) {
  if (!query) return [];
  const url = `${API_BASE}/rutas/autocomplete?query=${encodeURIComponent(query)}`;
  // Reutilizamos nuestra función apiFetch para mantener el código DRY.
  return await apiFetch(url);
}