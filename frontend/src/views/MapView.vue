<template>
  <div class="map-view-container">
    <button @click="toggleSidebar" class="menu-button">☰</button>
    <div class="sidebar-overlay" :class="{ active: isSidebarOpen }" @click="toggleSidebar"></div>
    
    <MenuLateral :is-open="isSidebarOpen" @close="toggleSidebar" />
    
    <main class="main-content">
      <ControlesBusqueda @buscar-ruta="handleBuscarRuta" />
      
      <ResultadosBusqueda 
        v-if="sugerenciasDeRuta.length > 0"
        :sugerencias="sugerenciasDeRuta"
        @ruta-seleccionada="handleRutaSeleccionada"
        @close="limpiarBusqueda"
      />

      <MapaContenedor :datos-viaje="datosDelViaje" />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import MenuLateral from '@/components/mapa/MenuLateral.vue';
import ControlesBusqueda from '@/components/mapa/ControlesBusqueda.vue';
import MapaContenedor from '@/components/mapa/MapaContenedor.vue';
import ResultadosBusqueda from '@/components/mapa/ResultadosBusqueda.vue'; // Importamos el nuevo componente
import { fetchSugerenciasDeRuta, fetchRutaPorId } from '@/services/api.js';

// --- Estado Reactivo ---
const isSidebarOpen = ref(false);
const sugerenciasDeRuta = ref([]); // Guardará las sugerencias de la API
const datosDelViaje = ref(null); // Guardará la ruta seleccionada para dibujarla

// --- Métodos ---
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const limpiarBusqueda = () => {
  sugerenciasDeRuta.value = [];
  datosDelViaje.value = null;
};

// Se ejecuta cuando ControlesBusqueda emite las coordenadas
const handleBuscarRuta = async ({ origen, destino }) => {
  limpiarBusqueda(); // Limpia resultados anteriores
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

// Se ejecuta cuando el usuario selecciona una ruta desde ResultadosBusqueda
const handleRutaSeleccionada = async (rutaSugerida) => {
  try {
    // Obtenemos el GeoJSON completo de la ruta para poder dibujarla
    const rutaGeoJSON = await fetchRutaPorId(rutaSugerida.routeId);
    
    // Creamos un objeto con toda la información necesaria para el mapa
    datosDelViaje.value = {
      ...rutaSugerida,
      geoJson: rutaGeoJSON, // El trazo completo de la ruta
    };

    // Ocultamos el panel de sugerencias después de seleccionar
    sugerenciasDeRuta.value = []; 

  } catch (error) {
    console.error("Error al obtener el GeoJSON de la ruta:", error);
    alert("No se pudo cargar el detalle de la ruta seleccionada.");
  }
};
</script>

<style scoped>
/* ... (Los estilos de MapView.vue se mantienen igual) ... */
.map-view-container {
  position: relative;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.main-content {
  height: 100%;
  width: 100%;
}

.menu-button {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1001;
  background-color: white;
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
  transition: transform 0.2s ease;
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