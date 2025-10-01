<template>
  <div id="mapa-leaflet" class="mapa-contenedor"></div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  datosViaje: { type: Object, default: null },
})

const map = ref(null)
const rutaLayer = ref(null)
const viajeMarkersLayer = ref(null)
const lightTileLayer = ref(null)

// --- ÍCONOS ACTUALIZADOS ---
// Función para crear íconos (sin cambios)
const createIcon = (iconUrl, size = [38, 38]) => {
  return L.icon({
    iconUrl: iconUrl,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1] / 2], // Centramos el ícono
    popupAnchor: [0, -size[1] / 2],
  })
}

// Nuevos íconos más estilizados y funcionales de Material Design Icons (MDI)
const originIcon = createIcon(
  'https://api.iconify.design/mdi:map-marker-radius.svg?color=%231a73e8',
)
const destinationIcon = createIcon(
  'https://api.iconify.design/mdi:flag-checkered.svg?color=%23e44234',
)
const busStopIcon = createIcon(
  // URL Corregida y con un mejor ícono
  'https://api.iconify.design/mdi:bus-stop.svg?color=%23fbbc05',
  [32, 32], // Un poco más pequeño para las paradas
)
const userLocationIcon = createIcon(
  'https://api.iconify.design/mdi:account-circle.svg?color=%2300c853',
)
// --- FIN DE ÍCONOS ACTUALIZADOS ---

function mostrarUbicacionUsuario() {
  if (!navigator.geolocation || !map.value) return
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      const marker = L.marker([lat, lng], { icon: userLocationIcon }).addTo(map.value)
      marker.bindPopup('📍 Mi ubicación actual').openPopup()
      map.value.setView([lat, lng], 15)
    },
    (err) => {
      console.warn('No se pudo obtener la ubicación:', err)
    },
  )
}

onMounted(() => {
  const xalapaBounds = L.latLngBounds(L.latLng(19.45, -97.05), L.latLng(19.6, -96.85))

  map.value = L.map('mapa-leaflet', {
    center: [19.5333, -96.9167],
    zoom: 13,
    zoomControl: false,

    minZoom: 12,
    maxZoom: 18,

    maxBounds: xalapaBounds,
    maxBoundsViscosity: 1.0,
  })

  lightTileLayer.value = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    bounds: xalapaBounds,
  })

  viajeMarkersLayer.value = L.layerGroup().addTo(map.value)

  lightTileLayer.value.addTo(map.value)

  mostrarUbicacionUsuario()
})

watch(
  () => props.datosViaje,
  (newViaje) => {
    if (!map.value) return

    if (rutaLayer.value) {
      map.value.removeLayer(rutaLayer.value)
      rutaLayer.value = null
    }
    viajeMarkersLayer.value.clearLayers()

    if (!newViaje || !newViaje.geoJson) {
      return
    }

    rutaLayer.value = L.geoJSON(newViaje.geoJson, {
      style: { color: '#e44234', weight: 6, opacity: 0.85 },
    }).addTo(map.value)

    if (
      newViaje.origenUsuario &&
      newViaje.destinoUsuario &&
      newViaje.paradaSubida &&
      newViaje.paradaBajada
    ) {
      const origenCoords = [newViaje.origenUsuario.lat, newViaje.origenUsuario.lng]
      const destinoCoords = [newViaje.destinoUsuario.lat, newViaje.destinoUsuario.lng]
      const paradaSubidaCoords = [
        newViaje.paradaSubida.coordinates[1],
        newViaje.paradaSubida.coordinates[0],
      ]
      const paradaBajadaCoords = [
        newViaje.paradaBajada.coordinates[1],
        newViaje.paradaBajada.coordinates[0],
      ]

      L.marker(origenCoords, { icon: originIcon })
        .addTo(viajeMarkersLayer.value)
        .bindPopup('📍 Tu Origen')
      L.marker(destinoCoords, { icon: destinationIcon })
        .addTo(viajeMarkersLayer.value)
        .bindPopup('🏁 Tu Destino')
      L.marker(paradaSubidaCoords, { icon: busStopIcon })
        .addTo(viajeMarkersLayer.value)
        .bindPopup(`🚍 Sube en: <b>${newViaje.paradaSubida.name}</b>`)
      L.marker(paradaBajadaCoords, { icon: busStopIcon })
        .addTo(viajeMarkersLayer.value)
        .bindPopup(`🚶‍♂️ Baja en: <b>${newViaje.paradaBajada.name}</b>`)

      const estiloCaminata = { color: '#1a73e8', weight: 4, dashArray: '5, 10' }
      L.polyline([origenCoords, paradaSubidaCoords], estiloCaminata).addTo(viajeMarkersLayer.value)
      L.polyline([paradaBajadaCoords, destinoCoords], estiloCaminata).addTo(viajeMarkersLayer.value)
    }

    const bounds = rutaLayer.value.getBounds()
    map.value.fitBounds(bounds, { padding: [50, 50] })
  },
  { deep: true },
)
</script>

<style scoped>
.mapa-contenedor {
  height: 100%;
  width: 100%;
  z-index: 0;
}
</style>
