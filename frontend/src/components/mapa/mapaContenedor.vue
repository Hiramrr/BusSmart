<template>
  <!-- Componente: mapaContenedor.vue -->
  <div class="mapa-contenedor">
    <main id="map-container">
      <!-- El div con ref="mapRef" será donde Leaflet monte el mapa -->
      <div id="map" ref="mapRef" aria-label="Mapa de Xalapa"></div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, defineExpose } from 'vue'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

//Aqui mejor puse esto para que el codigo sea mas legible
const XALAPA_COORDENADAS = [19.5333, -96.9167]
const ZOOM = 13
const COLOR = '#E42A2A'

let currentRouteLayer = null
const mapRef = ref(null)
let mapInstance = null

function instanciarMapa() {
  if (!mapRef.value) return

  mapInstance = L.map(mapRef.value, {
    center: XALAPA_COORDENADAS,
    zoom: ZOOM,
    zoomControl: false,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
  }).addTo(mapInstance)

  L.marker([19.5333, -96.9167])
    .addTo(mapInstance)
    .bindPopup('<b>Bienvenido a Xalapa</b><br>Aquí puedes mostrar rutas.')
    .openPopup()

  mapInstance.on('dblclick', function (e) {
    const { lat, lng } = e.latlng
    L.marker([lat, lng])
      .addTo(mapInstance)
      .bindPopup(`📍 Marcador en:<br>Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`)
      .openPopup()
  })
}

function dibujarRuta(geojsonData) {
  if (currentRouteLayer) {
    mapInstance.removeLayer(currentRouteLayer)
  }

  currentRouteLayer = L.geoJSON(geojsonData, {
    style: {
      color: COLOR,
      weight: 5,
      opacity: 0.85,
    },
  }).addTo(mapInstance)

  mapInstance.fitBounds(currentRouteLayer.getBounds())
}

defineExpose({
  dibujarRuta,
})

onMounted(() => {
  instanciarMapa()
})

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})
</script>

<style>
/* Estilos relacionados al contenedor del mapa */

#map-container {
  width: 100%;
  height: 100vh; /* ocupa toda la ventana */
  box-sizing: border-box;
}

#map {
  width: 100%;
  height: 100%;
  min-height: 320px;
}

.mapa-contenedor {
  font-family:
    system-ui,
    -apple-system,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial;
}
</style>
