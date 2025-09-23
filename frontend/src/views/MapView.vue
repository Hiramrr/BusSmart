<template>
  <div class="map-view-container" :class="{ 'theme-dark': isDarkTheme }">
    <button @click="toggleSidebar" class="menu-button">☰</button>
    <div class="sidebar-overlay" :class="{ active: isSidebarOpen }" @click="toggleSidebar"></div>
    
    <MenuLateral 
      :is-open="isSidebarOpen" 
      :is-dark-theme="isDarkTheme" 
      @close="toggleSidebar" 
      @mostrar-ruta="handleMostrarRuta" 
    />
    
    <main class="main-content">
      <ControlesBusqueda @buscar-ruta="handleBuscarRuta" />
      
      <ResultadosBusqueda 
        v-if="sugerenciasDeRuta.length > 0"
        :sugerencias="sugerenciasDeRuta"
        @ruta-seleccionada="handleRutaSeleccionada"
        @close="limpiarBusqueda"
      />

      <MapaContenedor 
        :datos-viaje="datosDelViaje" 
        :origen="puntoDeOrigen"
        :destino="puntoDeDestino"
        :is-dark-theme="isDarkTheme"
      />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import MenuLateral from '@/components/mapa/MenuLateral.vue';
import ControlesBusqueda from '@/components/mapa/ControlesBusqueda.vue';
import MapaContenedor from '@/components/mapa/MapaContenedor.vue';
import ResultadosBusqueda from '@/components/mapa/ResultadosBusqueda.vue';
import { fetchSugerenciasDeRuta, fetchRutaPorId } from '@/services/api.js';

const props = defineProps({
  isDarkTheme: Boolean
});

const isSidebarOpen = ref(false);
const sugerenciasDeRuta = ref([]);
const datosDelViaje = ref(null);
const puntoDeOrigen = ref(null);
const puntoDeDestino = ref(null);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const limpiarBusqueda = () => {
  sugerenciasDeRuta.value = [];
  datosDelViaje.value = null;
  puntoDeOrigen.value = null;
  puntoDeDestino.value = null;
};

const handleBuscarRuta = async ({ origen, destino }) => {
  limpiarBusqueda();
  
  puntoDeOrigen.value = origen;
  puntoDeDestino.value = destino;

  console.log("Buscando rutas para:", { origen, destino });
  try {
    const sugerencias = await fetchSugerenciasDeRuta(origen, destino);
    if (sugerencias.length === 0) {
      alert("No se encontraron rutas directas para tu viaje. Intenta con puntos de referencia más cercanos a las avenidas principales.");
    }
    sugerenciasDeRuta.value = sugerencias;
  } catch (error) {
    console.error("Error al obtener sugerencias:", error);
    alert("Hubo un problema al buscar las rutas. Por favor, inténtalo de nuevo.");
  }
};

const handleRutaSeleccionada = async (rutaSugerida) => {
  try {
    const rutaGeoJSON = await fetchRutaPorId(rutaSugerida.routeId);
    
    datosDelViaje.value = {
      ...rutaSugerida,
      geoJson: rutaGeoJSON,
    };

    sugerenciasDeRuta.value = []; 
  } catch (error) {
    console.error("Error al obtener el GeoJSON de la ruta:", error);
    alert("No se pudo cargar el detalle de la ruta seleccionada.");
  }
};

const handleMostrarRuta = async (routeId) => {
  try {
    const geoJson = await fetchRutaPorId(routeId);
    datosDelViaje.value = {
      geoJson: geoJson
    };
    sugerenciasDeRuta.value = [];
    puntoDeOrigen.value = null;
    puntoDeDestino.value = null;
  } catch (error) {
    console.error('Error al mostrar la ruta:', error);
    alert('No se pudo mostrar la ruta seleccionada.');
  }
};
</script>

<style scoped>
:root {
  --color-text-light: #2c3e50;
  --color-text-dark: #f0f0f0;
  --color-bg-light: #ffffff;
  --color-bg-dark: #1e1e1e;
  --color-surface-light: #f7f7f7;
  --color-surface-dark: #2a2a2a;
}

.map-view-container {
  position: relative;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  transition: background-color 0.3s ease;
  background-color: var(--color-bg-light);
}

.map-view-container.theme-dark {
  background-color: var(--color-bg-dark);
}

.main-content {
  height: 100%;
  width: 100%;
}

.menu-button {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 5000;
  border: none;
  border-radius: 50%;
  padding: 0;
  width: 50px;
  height: 50px;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, background-color 0.3s ease, color 0.3s ease;
  
  background-color: var(--color-surface-light);
  color: var(--color-text-light);
}

.map-view-container.theme-dark .menu-button {
  background-color: var(--color-surface-dark);
  color: var(--color-text-dark);
}

.menu-button:hover {
  transform: scale(1.1);
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1999;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.sidebar-overlay.active {
  opacity: 1;
  visibility: visible;
}
</style>