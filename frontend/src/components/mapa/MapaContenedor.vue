<template>
  <div id="mapa-leaflet" class="mapa-contenedor"></div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- Props ---
// 👇 NUEVO: Recibimos el origen y destino originales de la búsqueda
const props = defineProps({
  datosViaje: { type: Object, default: null },
  origen: { type: Object, default: null },
  destino: { type: Object, default: null },
});

// --- Estado Reactivo del Mapa ---
const map = ref(null);
const rutaLayer = ref(null);
// 👇 NUEVO: LayerGroup para manejar marcadores y líneas de caminata.
// Esto nos permite añadirlos o quitarlos del mapa todos a la vez.
const viajeMarkersLayer = ref(null);


// --- Iconos Personalizados ---
// 👇 NUEVO: Define iconos para un mejor aspecto visual.
// Puedes cambiar estas URLs por las de tus propios archivos de imagen.
const createIcon = (iconUrl, size = [35, 35]) => {
  return L.icon({
    iconUrl: iconUrl,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]], // La punta inferior del icono
    popupAnchor: [0, -size[1]] // El popup aparece arriba del icono
  });
};

const originIcon = createIcon('https://api.iconify.design/material-symbols:my-location.svg?color=%231a73e8');
const destinationIcon = createIcon('https://api.iconify.design/material-symbols:flag.svg?color=%23e44234');
const busStopIcon = createIcon('https://api.iconify.design/material-symbols:bus-stop.svg?color=%23fbbc05', [30, 30]);


// --- Ciclo de Vida: onMounted ---
onMounted(() => {
  map.value = L.map('mapa-leaflet', {
    center: [19.5333, -96.9167], // Xalapa
    zoom: 13,
    zoomControl: false,
  });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map.value);

  // 👇 NUEVO: Inicializamos nuestro LayerGroup y lo añadimos al mapa una sola vez.
  viajeMarkersLayer.value = L.layerGroup().addTo(map.value);
});


// --- Watcher (Observa los cambios y redibuja todo) ---
watch(() => props.datosViaje, (newViaje) => {
  if (!map.value) return;

  // Limpiar capas anteriores
  if (rutaLayer.value) {
    map.value.removeLayer(rutaLayer.value);
    rutaLayer.value = null;
  }
  viajeMarkersLayer.value.clearLayers();

  // Si no hay geoJson, no hacemos nada
  if (!newViaje || !newViaje.geoJson) {
    return;
  }

  // Dibujar la ruta principal
  rutaLayer.value = L.geoJSON(newViaje.geoJson, {
    style: { color: '#e44234', weight: 6, opacity: 0.85 },
  }).addTo(map.value);

  // Si hay origen/destino/paradas, dibuja marcadores y líneas de caminata
  if (props.origen && props.destino && newViaje.paradaSubida && newViaje.paradaBajada) {
    const origenCoords = [props.origen.lat, props.origen.lng];
    const destinoCoords = [props.destino.lat, props.destino.lng];
    const paradaSubidaCoords = [newViaje.paradaSubida.coordinates[1], newViaje.paradaSubida.coordinates[0]];
    const paradaBajadaCoords = [newViaje.paradaBajada.coordinates[1], newViaje.paradaBajada.coordinates[0]];

    L.marker(origenCoords, { icon: originIcon }).addTo(viajeMarkersLayer.value)
      .bindPopup("📍 Tu Origen");
    L.marker(destinoCoords, { icon: destinationIcon }).addTo(viajeMarkersLayer.value)
      .bindPopup("🏁 Tu Destino");
    L.marker(paradaSubidaCoords, { icon: busStopIcon }).addTo(viajeMarkersLayer.value)
      .bindPopup(`🚍 Sube en: <b>${newViaje.paradaSubida.name}</b>`);
    L.marker(paradaBajadaCoords, { icon: busStopIcon }).addTo(viajeMarkersLayer.value)
      .bindPopup(`🚶‍♂️ Baja en: <b>${newViaje.paradaBajada.name}</b>`);

    const estiloCaminata = { color: '#1a73e8', weight: 4, dashArray: '5, 10' };
    L.polyline([origenCoords, paradaSubidaCoords], estiloCaminata).addTo(viajeMarkersLayer.value);
    L.polyline([paradaBajadaCoords, destinoCoords], estiloCaminata).addTo(viajeMarkersLayer.value);
  }

  // Ajusta el zoom para mostrar la ruta
  const bounds = rutaLayer.value.getBounds();
  map.value.fitBounds(bounds, { padding: [50, 50] });

}, { deep: true });
</script>

<style scoped>
.mapa-contenedor {
  height: 100%;
  width: 100%;
  z-index: 0;
}
</style>