<template>
    <div class="map-container" ref="mapContainer"></div>
  </template>
  
  <script setup>
  import { onMounted, onUnmounted, ref, watch } from 'vue';
  import 'leaflet/dist/leaflet.css';
  import L from 'leaflet';
  
  // ------ Props y Emits ------
  const props = defineProps({
    mode: {
      type: String, // 'route' o 'stops'
      required: true,
    },
    // La línea de la ruta para mostrar como guía en el modo de paradas
    routeCoordinates: {
      type: Array,
      default: () => []
    }
  });
  
  const emit = defineEmits(['point-added']);
  
  // ------ Referencias ------
  const mapContainer = ref(null);
  let map = null;
  let routePolyline = null;
  const stopMarkers = [];
  
  // ------ Funciones de Leaflet ------
  
  // Inicializa el mapa centrado en Xalapa
  function initializeMap() {
    if (!mapContainer.value || map) return;
  
    map = L.map(mapContainer.value).setView([19.540, -96.910], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
  
    map.on('click', onMapClick);
  }
  
  // Maneja los clics en el mapa
  function onMapClick(e) {
    const latlng = e.latlng;
    // Leaflet usa {lat, lng}, GeoJSON usa [lon, lat]
    const coordinates = [latlng.lng, latlng.lat];
    
    if (props.mode === 'route') {
      addRoutePoint(latlng);
    } else if (props.mode === 'stops') {
      addStopMarker(latlng);
    }
  
    emit('point-added', coordinates);
  }
  
  // Añade un punto al trazado de la ruta
  function addRoutePoint(latlng) {
    routePolyline.addLatLng(latlng);
  }
  
  // Añade un marcador de parada
  function addStopMarker(latlng) {
    const stopIcon = L.divIcon({
      html: `<span>🚌</span>`,
      className: 'stop-marker-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });
  
    const marker = L.marker(latlng, { icon: stopIcon }).addTo(map);
    stopMarkers.push(marker);
  }
  
  // ------ Ciclo de Vida y Watchers ------
  onMounted(() => {
    initializeMap();
  
    // Dibuja la línea de la ruta inicial si se proporciona
    if (props.routeCoordinates.length > 0) {
      const guidePolyline = L.polyline(props.routeCoordinates.map(c => [c[1], c[0]]), { color: '#a9a9a9', weight: 5, dashArray: '5, 10' }).addTo(map);
      map.fitBounds(guidePolyline.getBounds());
    }
  
    // Inicializa la polilínea para el dibujo de la ruta
    routePolyline = L.polyline([], { color: '#3498db', weight: 5 }).addTo(map);
  });
  
  onUnmounted(() => {
    if (map) {
      map.remove();
      map = null;
    }
  });
  
  // Watcher para limpiar el mapa si el modo cambia (por ejemplo, al volver atrás en el asistente)
  watch(() => props.mode, () => {
    // Limpia las capas para evitar duplicados
    routePolyline.setLatLngs([]);
    stopMarkers.forEach(marker => marker.remove());
    stopMarkers.length = 0;
  });
  
  
  // Exponemos métodos para que el componente padre los pueda llamar
  defineExpose({
    undoLastPoint() {
      if (props.mode === 'route') {
        const latlngs = routePolyline.getLatLngs();
        if (latlngs.length > 0) {
          latlngs.pop();
          routePolyline.setLatLngs(latlngs);
          return true;
        }
      } else if (props.mode === 'stops') {
        if (stopMarkers.length > 0) {
          const lastMarker = stopMarkers.pop();
          lastMarker.remove();
          return true;
        }
      }
      return false;
    },
    clearMap() {
      routePolyline.setLatLngs([]);
      stopMarkers.forEach(marker => marker.remove());
      stopMarkers.length = 0;
    }
  });
  
  </script>
  
  <style>
  .map-container {
    height: 500px;
    width: 100%;
    border-radius: 12px;
    z-index: 1; /* Asegura que el mapa esté visible */
  }
  .stop-marker-icon {
    font-size: 1.5rem;
    text-align: center;
    line-height: 30px;
  }
  </style>