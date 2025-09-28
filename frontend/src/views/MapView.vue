<template>
  <div class="map-view-container" :class="{ 'theme-dark': isDarkTheme }">
    <button
      @click="toggleSidebar"
      class="menu-button"
      :class="{ open: isSidebarOpen, 'submenu-open': isSubmenuOpen }"
    >
      <div></div>
      <div></div>
      <div></div>
    </button>
    <div class="sidebar-overlay" :class="{ active: isSidebarOpen }" @click="toggleSidebar"></div>

    <MenuLateral
      :is-open="isSidebarOpen"
      :is-dark-theme="isDarkTheme"
      @close="toggleSidebar"
      @mostrar-ruta="handleMostrarRuta"
      @submenu-toggle="handleSubmenuToggle"
    />

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
import { ref, watch } from 'vue'
import { useAuth } from '@/componibles/useAuth.js'
import { useFavoritos } from '@/stores/favoritos.js'
import MenuLateral from '@/components/mapa/MenuLateral.vue'
import ControlesBusqueda from '@/components/mapa/ControlesBusqueda.vue'
import MapaContenedor from '@/components/mapa/MapaContenedor.vue'
import ResultadosBusqueda from '@/components/mapa/ResultadosBusqueda.vue' // Importamos el nuevo componente
import { fetchSugerenciasDeRuta, fetchRutaPorId } from '@/services/api.js'

const { isAuthenticated, isInitialized } = useAuth()
const { cargarFavoritos } = useFavoritos()
const isSidebarOpen = ref(false)
const isSubmenuOpen = ref(false)
const sugerenciasDeRuta = ref([])
const datosDelViaje = ref(null)
const puntoDeOrigen = ref(null)
const puntoDeDestino = ref(null)

// --- Métodos ---
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const handleSubmenuToggle = (val) => {
  isSubmenuOpen.value = val
}

const limpiarBusqueda = () => {
  sugerenciasDeRuta.value = []
  datosDelViaje.value = null
}

// Se ejecuta cuando ControlesBusqueda emite las coordenadas
const handleBuscarRuta = async ({ origen, destino }) => {
  limpiarBusqueda() // Limpia resultados anteriores
  console.log('Buscando rutas para:', { origen, destino })
  try {
    const sugerencias = await fetchSugerenciasDeRuta(origen, destino)
    if (sugerencias.length === 0) {
      alert(
        'No se encontraron rutas directas para tu viaje. Intenta con puntos de referencia más cercanos a las avenidas principales.',
      )
    }
    sugerenciasDeRuta.value = sugerencias
  } catch (error) {
    console.error('Error al obtener sugerencias:', error)
    alert('Hubo un problema al buscar las rutas. Por favor, inténtalo de nuevo.')
  }
}

// Se ejecuta cuando el usuario selecciona una ruta desde ResultadosBusqueda
const handleRutaSeleccionada = async (rutaSugerida) => {
  try {
    // Obtenemos el GeoJSON completo de la ruta para poder dibujarla
    const rutaGeoJSON = await fetchRutaPorId(rutaSugerida.routeId)

    // Creamos un objeto con toda la información necesaria para el mapa
    datosDelViaje.value = {
      ...rutaSugerida,
      geoJson: rutaGeoJSON, // El trazo completo de la ruta
    }

    // Ocultamos el panel de sugerencias después de seleccionar
    sugerenciasDeRuta.value = []
  } catch (error) {
    console.error('Error al obtener el GeoJSON de la ruta:', error)
    alert('No se pudo cargar el detalle de la ruta seleccionada.')
  }
}

watch(
  isInitialized,
  (listo) => {
    if (listo && isAuthenticated.value) {
      cargarFavoritos()
    }
  },
  { immediate: true },
)
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
  top: 20px;
  left: 20px;
  z-index: 2001;
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
.theme-dark .menu-button > div {
  background: rgb(255, 255, 255);
  height: 2.5px;
  width: 50%;
  border-radius: 5px;
  transition: all 0.6s;
  transform-origin: center;
}

.menu-button > div {
  background: rgb(0, 0, 0);
  height: 2.5px;
  width: 50%;
  border-radius: 5px;
  transition: all 0.6s;
  transform-origin: center;
}

.map-view-container.theme-dark .menu-button {
  background-color: var(--color-surface-dark);
  color: var(--color-text-dark);
}

.menu-button.open {
  left: 250px;
}

.menu-button.open.submenu-open {
  left: 350px; /* Ajusta 30vw si el ancho del sidebar cambia */
}

.menu-button.open div:nth-child(1) {
  transform: translateY(7.5px) rotate(45deg);
}
.menu-button.open div:nth-child(2) {
  opacity: 0;
}

.menu-button.open div:last-child {
  transform: translateY(-7.5px) rotate(-45deg);
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
  transition:
    opacity 0.3s ease,
    visibility 0.3s ease;
}

.sidebar-overlay.active {
  opacity: 1;
  visibility: visible;
}
</style>
