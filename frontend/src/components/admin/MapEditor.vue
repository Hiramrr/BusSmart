<template>
  <div class="map-editor-container" ref="mapContainer"></div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const props = defineProps({
  mode: {
    type: String, // 'route' o 'stops'
    required: true,
  },
  // Coordenadas iniciales para edición
  initialCoordinates: {
    type: Array,
    default: () => [],
  },
  // Paradas iniciales para edición
  initialStops: {
    type: Array,
    default: () => [],
  },
  // Solo lectura (preview)
  readonly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['coordinates-updated', 'stops-updated', 'point-added', 'point-removed'])

const mapContainer = ref(null)
let map = null
let editablePolyline = null
const stopMarkers = []
let routeCoordinates = []

// Inicializa el mapa
function initializeMap() {
  if (!mapContainer.value || map) return

  map = L.map(mapContainer.value).setView([19.54, -96.91], 13)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map)

  // Si no es readonly, permitir clics
  if (!props.readonly) {
    map.on('click', onMapClick)
  }

  // Cargar datos iniciales
  loadInitialData()
}

// Cargar datos iniciales (edición)
function loadInitialData() {
  if (props.mode === 'route' && props.initialCoordinates.length > 0) {
    // Convertir coordenadas GeoJSON [lng, lat] a Leaflet [lat, lng]
    const latlngs = props.initialCoordinates.map((c) => [c[1], c[0]])
    routeCoordinates = [...props.initialCoordinates]

    editablePolyline = L.polyline(latlngs, {
      color: '#3498db',
      weight: 5,
      opacity: 0.8,
    }).addTo(map)

    // Agregar marcadores editables en cada punto
    if (!props.readonly) {
      addEditableMarkers()
    }

    map.fitBounds(editablePolyline.getBounds())
  } else if (props.mode === 'stops' && props.initialStops.length > 0) {
    // Cargar paradas existentes
    props.initialStops.forEach((stop, index) => {
      const latlng = L.latLng(stop.geometry.coordinates[1], stop.geometry.coordinates[0])
      addStopMarker(latlng, stop, index)
    })

    // Mostrar también la ruta como guía
    if (props.initialCoordinates.length > 0) {
      const latlngs = props.initialCoordinates.map((c) => [c[1], c[0]])
      L.polyline(latlngs, {
        color: '#95a5a6',
        weight: 5,
        dashArray: '5, 10',
        opacity: 0.6,
      }).addTo(map)
      map.fitBounds(L.polyline(latlngs).getBounds())
    }
  } else {
    // Modo creación (sin datos iniciales)
    editablePolyline = L.polyline([], {
      color: '#3498db',
      weight: 5,
      opacity: 0.8,
    }).addTo(map)
  }
}

// Agregar marcadores editables para cada punto de la ruta
function addEditableMarkers() {
  routeCoordinates.forEach((coord, index) => {
    const latlng = L.latLng(coord[1], coord[0])

    // 🔧 CAMBIO: Usar divIcon personalizado en lugar de circleMarker
    const pointIcon = L.divIcon({
      html: `<div class="route-point-marker"></div>`,
      className: 'custom-route-point',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    })

    // 🔧 CAMBIO: Usar L.marker en lugar de L.circleMarker
    const marker = L.marker(latlng, {
      icon: pointIcon,
      draggable: true, // ← Ahora SÍ funciona
    }).addTo(map)

    // Permitir arrastrar el punto
    marker.on('drag', (e) => {
      const newLatLng = e.target.getLatLng()
      routeCoordinates[index] = [newLatLng.lng, newLatLng.lat]
      updatePolyline()
    })

    marker.on('dragend', () => {
      emit('coordinates-updated', [...routeCoordinates])
    })

    // Clic derecho para eliminar
    marker.on('contextmenu', (e) => {
      L.DomEvent.preventDefault(e)
      if (routeCoordinates.length > 2) {
        removePoint(index, marker)
      }
    })

    // Tooltip con información
    marker.bindTooltip(
      `Punto ${index + 1}<br><small>Clic derecho para eliminar<br>Arrastra para mover</small>`,
      {
        permanent: false,
        direction: 'top',
      },
    )
  })
}

// Actualizar la polilínea
function updatePolyline() {
  const latlngs = routeCoordinates.map((c) => [c[1], c[0]])
  editablePolyline.setLatLngs(latlngs)
}

// Eliminar un punto
function removePoint(index, marker) {
  routeCoordinates.splice(index, 1)
  marker.remove()
  updatePolyline()
  clearAndRedrawMarkers()
  emit('coordinates-updated', [...routeCoordinates])
  emit('point-removed', index)
}

// Limpiar y redibujar todos los marcadores
function clearAndRedrawMarkers() {
  map.eachLayer((layer) => {
    if (layer instanceof L.CircleMarker) {
      layer.remove()
    }
  })
  addEditableMarkers()
}

// Manejo de clics en el mapa
function onMapClick(e) {
  const latlng = e.latlng
  const coordinates = [latlng.lng, latlng.lat]

  if (props.mode === 'route') {
    routeCoordinates.push(coordinates)
    updatePolyline()
    clearAndRedrawMarkers()
    emit('point-added', coordinates)
    emit('coordinates-updated', [...routeCoordinates])
  } else if (props.mode === 'stops') {
    addStopMarker(latlng)
    emit('point-added', coordinates)
  }
}

// Agregar marcador de parada
function addStopMarker(latlng, stopData = null, existingIndex = null) {
  const stopIcon = L.divIcon({
    html: `<div class="stop-marker-custom">
      <span class="stop-icon">🚌</span>
      <span class="stop-number">${existingIndex !== null ? existingIndex + 1 : stopMarkers.length + 1}</span>
    </div>`,
    className: 'custom-stop-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  })

  const marker = L.marker(latlng, {
    icon: stopIcon,
    draggable: !props.readonly,
  }).addTo(map)

  if (!props.readonly) {
    marker.on('drag', () => {
      emitStopsUpdate()
    })

    marker.on('dragend', () => {
      emitStopsUpdate()
    })

    // Clic derecho para eliminar
    marker.on('contextmenu', (e) => {
      L.DomEvent.preventDefault(e)
      removeStopMarker(marker)
    })

    marker.bindTooltip(
      `Parada ${stopMarkers.length + 1}<br><small>Clic derecho para eliminar<br>Arrastra para mover</small>`,
      {
        permanent: false,
        direction: 'top',
      },
    )
  }

  stopMarkers.push(marker)
  emitStopsUpdate()
}

// Eliminar marcador de parada
function removeStopMarker(marker) {
  const index = stopMarkers.indexOf(marker)
  if (index > -1) {
    stopMarkers.splice(index, 1)
    marker.remove()
    renumberStops()
    emitStopsUpdate()
    emit('point-removed', index)
  }
}

// Renumerar paradas
function renumberStops() {
  stopMarkers.forEach((marker, index) => {
    const newIcon = L.divIcon({
      html: `<div class="stop-marker-custom">
        <span class="stop-icon">🚌</span>
        <span class="stop-number">${index + 1}</span>
      </div>`,
      className: 'custom-stop-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    })
    marker.setIcon(newIcon)
  })
}

// Emitir actualización de paradas
function emitStopsUpdate() {
  const stops = stopMarkers.map((marker, index) => {
    const latlng = marker.getLatLng()
    return {
      type: 'Feature',
      properties: {
        sequence: index,
      },
      geometry: {
        type: 'Point',
        coordinates: [latlng.lng, latlng.lat],
      },
    }
  })
  emit('stops-updated', stops)
}

// Métodos expuestos
defineExpose({
  undoLastPoint() {
    if (props.mode === 'route' && routeCoordinates.length > 0) {
      routeCoordinates.pop()
      updatePolyline()
      clearAndRedrawMarkers()
      emit('coordinates-updated', [...routeCoordinates])
      return true
    } else if (props.mode === 'stops' && stopMarkers.length > 0) {
      const lastMarker = stopMarkers.pop()
      lastMarker.remove()
      renumberStops()
      emitStopsUpdate()
      return true
    }
    return false
  },

  clearMap() {
    if (props.mode === 'route') {
      routeCoordinates = []
      updatePolyline()
      map.eachLayer((layer) => {
        if (layer instanceof L.CircleMarker) {
          layer.remove()
        }
      })
      emit('coordinates-updated', [])
    } else if (props.mode === 'stops') {
      stopMarkers.forEach((marker) => marker.remove())
      stopMarkers.length = 0
      emitStopsUpdate()
    }
  },

  getCoordinates() {
    return [...routeCoordinates]
  },

  getStops() {
    return stopMarkers.map((marker, index) => {
      const latlng = marker.getLatLng()
      return {
        type: 'Feature',
        properties: { sequence: index },
        geometry: {
          type: 'Point',
          coordinates: [latlng.lng, latlng.lat],
        },
      }
    })
  },
})

onMounted(() => {
  initializeMap()
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})

// Watch para cambios en coordenadas iniciales
watch(
  () => props.initialCoordinates,
  (newCoords) => {
    if (map && newCoords.length > 0 && props.mode === 'route') {
      routeCoordinates = [...newCoords]
      updatePolyline()
      clearAndRedrawMarkers()
    }
  },
  { deep: true },
)
</script>

<style scoped>
.map-editor-container {
  height: 500px;
  width: 100%;
  border-radius: 12px;
  z-index: 1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.custom-stop-marker) {
  background: transparent;
}

:deep(.stop-marker-custom) {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

:deep(.stop-icon) {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

:deep(.stop-number) {
  position: absolute;
  top: 8px;
  background: #e74c3c;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

:deep(.custom-route-point) {
  background: transparent;
}

:deep(.route-point-marker) {
  width: 16px;
  height: 16px;
  background-color: #3498db;
  border: 3px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  cursor: move;
  transition: all 0.2s ease;
}

:deep(.route-point-marker:hover) {
  background-color: #2980b9;
  transform: scale(1.2);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
}
</style>
