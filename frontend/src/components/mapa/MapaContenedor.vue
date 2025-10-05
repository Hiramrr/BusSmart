<template>
  <div id="mapa-leaflet" class="mapa-contenedor"></div>

  <button
    v-if="rutaLayer"
    @click="limpiarRuta"
    class="btn-limpiar-ruta"
    title="Borrar ruta del mapa"
  >
    🗑️ Limpiar Ruta
  </button>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  datosViaje: { type: Object, default: null },
})

const emit = defineEmits(['ruta-limpiada'])

const map = ref(null)
const rutaLayer = ref(null)
const viajeMarkersLayer = ref(null)
const lightTileLayer = ref(null)

const createIcon = (iconUrl, size = [38, 38]) => {
  return L.icon({
    iconUrl: iconUrl,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1] / 2],
    popupAnchor: [0, -size[1] / 2],
  })
}

const originIcon = createIcon(
  'https://api.iconify.design/mdi:map-marker-radius.svg?color=%231a73e8',
)
const destinationIcon = createIcon(
  'https://api.iconify.design/mdi:flag-checkered.svg?color=%23e44234',
)
const busStopIcon = createIcon(
  'https://api.iconify.design/si:pin-fill.svg?color=%23ff0909',
  [32, 32],
)
const userLocationIcon = createIcon(
  'https://api.iconify.design/mdi:account-circle.svg?color=%2300c853',
)

const limpiarRuta = () => {
  if (rutaLayer.value && map.value) {
    map.value.removeLayer(rutaLayer.value)
    rutaLayer.value = null
  }

  if (viajeMarkersLayer.value) {
    viajeMarkersLayer.value.clearLayers()
  }

  emit('ruta-limpiada')
}

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
  console.log('🗺️ Intentando inicializar mapa...')

  try {
    const xalapaBounds = L.latLngBounds(L.latLng(19.42, -97.1), L.latLng(19.65, -96.8))
    map.value = L.map('mapa-leaflet', {
      center: [19.545705, -96.910282],
      zoom: 13,
      zoomControl: false,
      minZoom: 12,
      maxZoom: 18,
      maxBounds: xalapaBounds,
      maxBoundsViscosity: 1.0,
    })

    console.log('✅ Mapa inicializado')

    lightTileLayer.value = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      bounds: xalapaBounds,
    })

    viajeMarkersLayer.value = L.layerGroup().addTo(map.value)
    lightTileLayer.value.addTo(map.value)

    console.log('✅ Capas agregadas')

    mostrarUbicacionUsuario()
  } catch (error) {
    console.error('❌ Error al inicializar mapa:', error)
  }
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
      style: { color: '#0949df', weight: 6, opacity: 0.85 },
    }).addTo(map.value)

    if (newViaje.paradas && newViaje.paradas.features) {
      newViaje.paradas.features.forEach((parada, index) => {
        const coords = [parada.geometry.coordinates[1], parada.geometry.coordinates[0]]
        L.marker(coords, { icon: busStopIcon })
          .addTo(viajeMarkersLayer.value)
          .bindPopup(`🚏 Parada ${index + 1}`)
      })
    }

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

      const estiloCaminata = { color: '#7db0e3', weight: 4, dashArray: '5, 10' }
      L.polyline([origenCoords, paradaSubidaCoords], estiloCaminata).addTo(viajeMarkersLayer.value)
      L.polyline([paradaBajadaCoords, destinoCoords], estiloCaminata).addTo(viajeMarkersLayer.value)
    }

    const bounds = rutaLayer.value.getBounds()
    map.value.fitBounds(bounds, { padding: [80, 80] })
  },
  { deep: true },
)
</script>

<style scoped>
.mapa-contenedor {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.btn-limpiar-ruta {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background: #cf2900;
  border: 2px solid #cf2900;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-limpiar-ruta:hover {
  background: #a82400;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(228, 66, 52, 0.3);
}

.btn-limpiar-ruta:active {
  transform: translateY(0);
}
</style>
