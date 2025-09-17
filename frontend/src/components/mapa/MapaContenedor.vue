<template>
  <div id="mapa-leaflet" class="mapa-contenedor"></div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const props = defineProps({
  datosViaje: {
    type: Object,
    default: null,
  },
});

const map = ref(null);
const rutaLayer = ref(null);

onMounted(() => {
  map.value = L.map('mapa-leaflet', {
    center: [19.5333, -96.9167], // Centro en Xalapa
    zoom: 13,
    zoomControl: false,
  });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map.value);
});

// --- Watcher ---
//    Usamos una función `() => props.datosViaje` para observar cambios en el objeto.
watch(() => props.datosViaje, (newViaje) => {
  if (!map.value) return;

  if (rutaLayer.value) {
    map.value.removeLayer(rutaLayer.value);
  }

  // Comprobamos que existan tanto el objeto del viaje como la propiedad geoJson.
  if (newViaje && newViaje.geoJson) {
    rutaLayer.value = L.geoJSON(newViaje.geoJson, {
      style: {
        color: '#e44234',
        weight: 6, // Un poco más grueso para que resalte
        opacity: 0.85,
      },
    }).addTo(map.value);

    // Hacemos zoom para que la nueva ruta se vea completa.
    map.value.fitBounds(rutaLayer.value.getBounds());
  }
}, {
    deep: true 
});
</script>

<style scoped>
.mapa-contenedor {
  height: 100%;
  width: 100%;
  z-index: 0;
}
</style>