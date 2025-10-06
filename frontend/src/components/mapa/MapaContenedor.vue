<template>
  <div id="mapa-leaflet" class="mapa-contenedor"></div>

  <button
    v-if="rutaLayer"
    @click="limpiarRuta"
    class="btn-limpiar-ruta"
    title="Borrar ruta del mapa"
  >
    🗑️ <span class="btn-text">Limpiar Ruta</span>
  </button>
  <button
    v-if="rutaLayer"
    @click="toggleReportes"
    class="btn-toggle-reportes"
    :title="showReportes ? 'Ocultar alertas' : 'Mostrar alertas'"
  >
    <span v-if="showReportes">Ocultar alertas</span>
    <span v-else>Mostrar alertas</span>
  </button>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useForoStore } from '@/stores/foro'
import { useMapSelection } from '@/stores/mapSelection'

const props = defineProps({
  datosViaje: { type: Object, default: null },
})

const emit = defineEmits(['ruta-limpiada'])

const map = ref(null)
const rutaLayer = ref(null)
const viajeMarkersLayer = ref(null)
const lightTileLayer = ref(null)
const reportesLayer = ref(null)
const foroStore = useForoStore()
const showReportes = ref(true) // State to control visibility of report markers
const toggleReportes = () => {
  showReportes.value = !showReportes.value
  renderReportMarkers() // Re-render markers based on the new state
}
const mapSelection = useMapSelection()

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
  reportesLayer.value = L.layerGroup().addTo(map.value)
    lightTileLayer.value.addTo(map.value)

    console.log('✅ Capas agregadas')

    mostrarUbicacionUsuario()

    // load recent reports and render markers
    foroStore.cargarReportesRecientes().then(() => {
      renderReportMarkers()
    })

    // click handler for selecting point when user wants to mark on map
    map.value.on('click', (e) => {
      if (mapSelection.selecting) {
        const { lat, lng } = e.latlng
        mapSelection.setPoint(lat, lng)
        // show a temporary marker
        if (reportesLayer.value) {
          // remove previous temp marker
          if (mapSelection._tempMarker) {
            map.value.removeLayer(mapSelection._tempMarker)
            mapSelection._tempMarker = null
          }
          const temp = L.marker([lat, lng], {
            icon: L.divIcon({
              html: '<div class="temp-report-marker">📍</div>',
              className: 'temp-report-marker-container',
              iconSize: [94, 94],
              iconAnchor: [52, 84],
            }),
          }).addTo(reportesLayer.value)
          mapSelection._tempMarker = temp
        }
      }
    })
  } catch (error) {
    console.error('❌ Error al inicializar mapa:', error)
  }
})

watch(
  () => props.datosViaje,
  (newViaje) => {
    if (!map.value) return
    // when a new route is loaded, restore alerts visibility
    showReportes.value = true

    if (rutaLayer.value) {
      map.value.removeLayer(rutaLayer.value)
      rutaLayer.value = null
    }
    viajeMarkersLayer.value.clearLayers()

    if (!newViaje || !newViaje.geoJson) {
      // still render report markers even if there's no route
      renderReportMarkers()
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

    // after drawing route, re-render report markers so they appear on top
    renderReportMarkers()
  },
  { deep: true },
)

function clearReportMarkers() {
  if (reportesLayer.value) reportesLayer.value.clearLayers()
}

function renderReportMarkers() {
  if (!map.value || !reportesLayer.value) return
  reportesLayer.value.clearLayers()

  // If alerts are hidden, don't render markers (layer already cleared)
  if (!showReportes.value) return

  const reports = foroStore.reportes || []
  reports.forEach((r) => {
    const coords = r.lat && r.lng ? [r.lat, r.lng] : r.location && r.location.coordinates ? [r.location.coordinates[1], r.location.coordinates[0]] : null
    if (!coords) return

    const iconHtml = r.tipo === 'incidencia' ? '⚠️' : '🚦'
    const marker = L.marker(coords, {
      icon: L.divIcon({
        html: `<div class="report-marker">${iconHtml}</div>`,
  className: 'report-marker-container',
  iconSize: [64, 64],
  iconAnchor: [32, 64],
      }),
    }).addTo(reportesLayer.value)

    const popupContent = `
      <div style="max-width:220px;">
        <strong>${r.tipo === 'incidencia' ? 'Incidencia' : 'Alerta'}</strong><br/>
        <div>${r.descripcion || ''}</div>
        <div style="margin-top:6px; font-size:0.85em; color:#666;">${r.fecha || ''}</div>
      </div>
    `
    marker.bindPopup(popupContent)
  })
}

// react to new reportes in store
watch(() => foroStore.reportes, () => {
  renderReportMarkers()
})
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

/* Report marker styles */
.report-marker-container .report-marker {
  width: 64px;
  height: 64px;
  border-radius: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.32);
  background: white;
}

.temp-report-marker {
  font-size: 34px;
}

.temp-report-marker-container {
  transform: translateY(-6px);
}

.btn-limpiar-ruta {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 2500;
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
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.btn-limpiar-ruta:hover {
  background: #a82400;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(228, 66, 52, 0.3);
}

.btn-limpiar-ruta:active {
  transform: translateY(0);
  background: #8a1e00;
}

/* Responsive Design - Mobile */
@media (max-width: 768px) {
  .btn-limpiar-ruta {
    position: fixed;
    bottom: 80px;
    top: auto;
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    padding: 14px 24px;
    font-size: 15px;
    border-radius: 30px;
    min-width: 170px;
    min-height: 48px;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    z-index: 2500;
  }

  .btn-limpiar-ruta:hover {
    transform: translateX(-50%) translateY(-2px);
  }

  .btn-limpiar-ruta:active {
    transform: translateX(-50%) scale(0.95);
    background: #8a1e00;
  }
}

@media (max-width: 480px) {
  .btn-limpiar-ruta {
    bottom: 70px;
    padding: 13px 22px;
    font-size: 14px;
    min-width: 155px;
    min-height: 46px;
  }

  .btn-text {
    font-size: 13px;
  }
}

/* Mejora para pantallas muy pequeñas */
@media (max-width: 360px) {
  .btn-limpiar-ruta {
    padding: 12px 20px;
    min-width: 140px;
    min-height: 44px;
    font-size: 13px;
    bottom: 65px;
  }
}

/* Toggle reportes button */
.btn-toggle-reportes {
  position: fixed;
  top: 72px;
  right: 20px; /* to the left of limpiar button */
  z-index: 2500;
  background: #2b8fef;
  border: 2px solid #2b8fef;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-toggle-reportes:hover {
  background: #1f6fd1;
  border-color: #1f6fd1;
  transform: translateY(-2px);
}

.btn-toggle-reportes:active {
  transform: translateY(0);
  background: #185bb0;
}
</style>
