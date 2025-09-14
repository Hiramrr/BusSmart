<template>
  <div class="map-view-container">
    <button @click="toggleSidebar" class="menu-button">☰</button>
    
    <MenuLateral :is-open="isSidebarOpen" @close="toggleSidebar" />
    
    <main class="main-content">
      <ControlesBusqueda @buscar-ruta="handleBuscarRuta" />
      <MapaContenedor :ruta-geo-json="rutaActualGeoJSON" />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import MenuLateral from '@/components/mapa/MenuLateral.vue';
import ControlesBusqueda from '@/components/mapa/ControlesBusqueda.vue';
import MapaContenedor from '@/components/mapa/MapaContenedor.vue';
import { fetchRutaPorId } from '@/services/api.js'; // Asumimos que esta función existe en api.js

// --- Estado Reactivo ---
// Controla si el menú lateral está visible o no.
const isSidebarOpen = ref(false);
// Almacena los datos GeoJSON de la ruta que se está mostrando en el mapa.
const rutaActualGeoJSON = ref(null);

// --- Métodos ---
// Cambia el estado de visibilidad del menú lateral.
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

// Manejador del evento 'buscar-ruta' emitido por ControlesBusqueda.
const handleBuscarRuta = async (idRuta) => {
  console.log(`Buscando datos para la ruta con ID: ${idRuta}`);
  try {
    // Llama a la API para obtener el GeoJSON y lo guarda en el estado.
    const data = await fetchRutaPorId(idRuta);
    rutaActualGeoJSON.value = data;
  } catch (error) {
    console.error("Error al obtener la ruta:", error);
    alert("No se pudo encontrar la ruta solicitada.");
    rutaActualGeoJSON.value = null; // Limpia la ruta en caso de error
  }
};
</script>

<style scoped>
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
  top: 15px;
  left: 15px;
  z-index: 1001; /* Encima de todo, excepto el menú cuando está abierto */
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px 15px;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}
</style>