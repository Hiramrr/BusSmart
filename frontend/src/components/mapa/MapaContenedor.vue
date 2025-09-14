<template>
  <div id="mapa-leaflet" class="mapa-contenedor"></div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- Props ---
// Definimos la 'prop' que recibirá los datos GeoJSON desde el componente padre (MapView).
const props = defineProps({
  rutaGeoJSON: {
    type: Object,
    default: null,
  },
});

// --- Estado Reactivo ---
// 'map' es una referencia para guardar la instancia del mapa de Leaflet.
const map = ref(null);
// 'rutaLayer' es una referencia para la capa de la ruta, para poder eliminarla y redibujarla.
const rutaLayer = ref(null);

// --- Ciclo de Vida: onMounted ---
// Se ejecuta una vez que el componente está montado en el DOM.
onMounted(() => {
  // Inicializamos el mapa en el div 'mapa-leaflet'.
  map.value = L.map('mapa-leaflet', {
  center: [19.5333, -96.9167],
  zoom: 13,
  zoomControl: false,
});
  // Añadimos una capa de teselas (el fondo del mapa).
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map.value);
});

// --- Watcher ---
// 'watch' observa cambios en la prop 'rutaGeoJSON'.
// Cada vez que 'MapView' nos pasa una nueva ruta, esta función se ejecuta.
watch(() => props.rutaGeoJSON, (newGeoJSON) => {
  if (!map.value) return; // Si el mapa no está listo, no hacemos nada.

  // Si ya hay una ruta dibujada, la eliminamos.
  if (rutaLayer.value) {
    map.value.removeLayer(rutaLayer.value);
  }

  // Si los nuevos datos GeoJSON no son nulos, los dibujamos.
  if (newGeoJSON) {
    rutaLayer.value = L.geoJSON(newGeoJSON, {
      style: {
        color: '#e44234', // Un color llamativo
        weight: 5,
        opacity: 0.8,
      },
    }).addTo(map.value);

    // Hacemos zoom para que la ruta se vea completa.
    map.value.fitBounds(rutaLayer.value.getBounds());
  }
});
</script>

<style scoped>
.mapa-contenedor {
  height: 100%;
  width: 100%;
  z-index: 0;
}
</style>