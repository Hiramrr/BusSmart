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

let editableMarkers = []

function addEditableMarkers() {
  clearEditableMarkers()

  routeCoordinates.forEach((coord, index) => {
    const latlng = L.latLng(coord[1], coord[0])

    const pointIcon = L.divIcon({
      html: `<div class="route-point-marker"></div>`,
      className: 'custom-route-point',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    })

    const marker = L.marker(latlng, {
      icon: pointIcon,
      draggable: true,
    }).addTo(map)

    // Permitir arrastrar el punto
    marker.on('drag', (e) => {
      const newLatLng = e.target.getLatLng()
      routeCoordinates[index] = [newLatLng.lng, newLatLng.lat]
      updatePolyline()
    })

    marker.on('dragend', () => {
      emit('coordinates-updated', [...routeCoordinates])
      addEditableMarkers()
    })

    marker.on('contextmenu', (e) => {
      L.DomEvent.preventDefault(e)
      if (routeCoordinates.length > 2) {
        removePoint(index, marker)
      }
    })

    marker.bindTooltip(
      `Punto ${index + 1}<br><small>Clic derecho para eliminar<br>Arrastra para mover</small>`,
      {
        permanent: false,
        direction: 'top',
      },
    )

    editableMarkers.push(marker)
  })
}

function clearEditableMarkers() {
  editableMarkers.forEach((marker) => {
    marker.off()
    map.removeLayer(marker)
  })
  editableMarkers = []
}

function updatePolyline() {
  const latlngs = routeCoordinates.map((c) => [c[1], c[0]])
  editablePolyline.setLatLngs(latlngs)
}

function removePoint(index, marker) {
  routeCoordinates.splice(index, 1)
  map.removeLayer(marker)
  updatePolyline()
  emit('coordinates-updated', [...routeCoordinates])
  addEditableMarkers()
}
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
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
}

@media (max-width: 768px) {
  .map-editor-container {
    height: 400px;
    border-radius: 8px;
  }
}

@media (max-width: 480px) {
  .map-editor-container {
    height: 350px;
    border-radius: 8px;
  }
}

:deep(.custom-stop-marker) {
  background: transparent;
  touch-action: none;
}

:deep(.stop-marker-custom) {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
}

:deep(.stop-icon) {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  transition: transform 0.2s ease;
}

@media (max-width: 768px) {
  :deep(.stop-icon) {
    font-size: 2.5rem;
  }
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
  user-select: none;
  -webkit-user-select: none;
}

@media (max-width: 768px) {
  :deep(.stop-number) {
    width: 24px;
    height: 24px;
    font-size: 0.85rem;
    top: 10px;
  }
}

:deep(.custom-route-point) {
  background: transparent;
  touch-action: none;
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
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

@media (max-width: 768px) {
  :deep(.route-point-marker) {
    width: 24px;
    height: 24px;
    border: 4px solid white;
  }
}

@media (max-width: 480px) {
  :deep(.route-point-marker) {
    width: 28px;
    height: 28px;
    border: 4px solid white;
  }
}

:deep(.route-point-marker:hover),
:deep(.route-point-marker:active) {
  background-color: #2980b9;
  transform: scale(1.2);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
}

:deep(.leaflet-tooltip) {
  padding: 8px 12px;
  font-size: 14px;
  line-height: 1.4;
  border-radius: 6px;
  white-space: nowrap;
}

@media (max-width: 768px) {
  :deep(.leaflet-tooltip) {
    padding: 10px 14px;
    font-size: 15px;
    max-width: 200px;
    white-space: normal;
  }
}

:deep(.leaflet-control-zoom) {
  margin-top: 10px;
  margin-right: 10px;
}

@media (max-width: 768px) {
  :deep(.leaflet-control-zoom) {
    margin-top: 60px;
    margin-right: 10px;
  }

  :deep(.leaflet-control-zoom a) {
    width: 40px;
    height: 40px;
    line-height: 40px;
    font-size: 24px;
  }
}

:deep(.leaflet-control-attribution) {
  font-size: 10px;
  padding: 2px 5px;
}

@media (max-width: 480px) {
  :deep(.leaflet-control-attribution) {
    font-size: 8px;
    padding: 1px 3px;
  }
}

:deep(.leaflet-marker-draggable) {
  cursor: move;
  cursor: -webkit-grab;
  cursor: grab;
}

:deep(.leaflet-marker-draggable:active) {
  cursor: -webkit-grabbing;
  cursor: grabbing;
}

@media (max-width: 768px) {
  :deep(.leaflet-zoom-animated) {
    will-change: transform;
  }

  :deep(.leaflet-tile) {
    will-change: transform;
  }
}

:deep(.leaflet-dragging) {
  :deep(.route-point-marker),
  :deep(.stop-marker-custom) {
    opacity: 0.7;
    transform: scale(1.3);
  }
}

:deep(.leaflet-popup) {
  margin-bottom: 30px;
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
  padding: 4px;
}

:deep(.leaflet-popup-content) {
  margin: 12px;
  line-height: 1.4;
  font-size: 14px;
}

@media (max-width: 768px) {
  :deep(.leaflet-popup-content) {
    font-size: 15px;
    margin: 14px;
  }
}

:deep(.leaflet-container) {
  touch-action: pan-x pan-y;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

:deep(.leaflet-interactive) {
  pointer-events: auto;
  touch-action: none;
}

@media (max-width: 768px) {
  :deep(.custom-route-point)::before {
    content: '';
    position: absolute;
    top: -15px;
    left: -15px;
    right: -15px;
    bottom: -15px;
    background: transparent;
  }

  :deep(.custom-stop-marker)::before {
    content: '';
    position: absolute;
    top: -20px;
    left: -20px;
    right: -20px;
    bottom: -20px;
    background: transparent;
  }
}
</style>
