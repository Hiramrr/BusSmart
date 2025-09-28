<template>
  <div id="mapa-leaflet" class="mapa-contenedor"></div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  datosViaje: { type: Object, default: null },
  origen: { type: Object, default: null },
  destino: { type: Object, default: null },
  isDarkTheme: Boolean,
})

const map = ref(null)
const rutaLayer = ref(null)
const viajeMarkersLayer = ref(null)
const lightTileLayer = ref(null)
const darkTileLayer = ref(null)

const createIcon = (iconUrl, size = [35, 35]) => {
  return L.icon({
    iconUrl: iconUrl,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]],
    popupAnchor: [0, -size[1]],
  })
}

const originIcon = createIcon(
  'https://api.iconify.design/material-symbols:my-location.svg?color=%231a73e8',
)
const destinationIcon = createIcon(
  'https://api.iconify.design/material-symbols:flag.svg?color=%23e44234',
)
const busStopIcon = createIcon(
  'https://api.iconify.design/material-symbols:bus-stop.svg?color=%23fbbc05',
  [30, 30],
)

// Ícono personalizado para mostrar la ubicación del usuario en el mapa
const userLocationIcon = createIcon(
  'https://api.iconify.design/material-symbols:person-pin-circle.svg?color=%2300c853',
  [38, 38],
)

// Función para obtener y mostrar la ubicación actual del usuario en el mapa
// Utiliza la API de geolocalización del navegador
function mostrarUbicacionUsuario() {
  // Verifica que el navegador soporte geolocalización y que el mapa esté inicializado
  if (!navigator.geolocation || !map.value) return
  // Solicita la ubicación actual al navegador
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      // Extrae latitud y longitud de la respuesta
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      // Crea y agrega un marcador en la ubicación del usuario usando el ícono personalizado
      const marker = L.marker([lat, lng], { icon: userLocationIcon }).addTo(map.value)
      // Muestra un popup sobre el marcador con el texto "Mi ubicación actual"
      marker.bindPopup('📍 Mi ubicación actual').openPopup()
      // Centra el mapa en la ubicación del usuario con un nivel de zoom adecuado
      map.value.setView([lat, lng], 15)
    },
    (err) => {
      // Si ocurre un error (por ejemplo, permisos denegados), muestra un mensaje en consola
      console.warn('No se pudo obtener la ubicación:', err)
    },
  )
}

onMounted(() => {
  map.value = L.map('mapa-leaflet', {
    center: [19.5333, -96.9167],
    zoom: 13,
    zoomControl: false,
  })

  lightTileLayer.value = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  })
  darkTileLayer.value = L.tileLayer(
    'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
    {
      attribution:
        '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    },
  )

  viajeMarkersLayer.value = L.layerGroup().addTo(map.value)

  if (props.isDarkTheme) {
    darkTileLayer.value.addTo(map.value)
  } else {
    lightTileLayer.value.addTo(map.value)
  }

  // Llama a la función para mostrar la ubicación del usuario al cargar el mapa
  mostrarUbicacionUsuario()
})

watch(
  () => props.isDarkTheme,
  (isDark) => {
    if (!map.value) return

    if (isDark) {
      map.value.removeLayer(lightTileLayer.value)
      darkTileLayer.value.addTo(map.value)
    } else {
      map.value.removeLayer(darkTileLayer.value)
      lightTileLayer.value.addTo(map.value)
    }
  },
)

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

    if (props.origen && props.destino && newViaje.paradaSubida && newViaje.paradaBajada) {
      const origenCoords = [props.origen.lat, props.origen.lng]
      const destinoCoords = [props.destino.lat, props.destino.lng]
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
