<template>
  <div class="map-view-container" :class="{ 'theme-dark': isDarkTheme }">
    <button
      @click="toggleSidebar"
      class="menu-button"
      :class="{ open: isSidebarOpen, 'submenu-open': isSubmenuOpen }"
      aria-label="Menú"
    >
      <img
        v-if="!isSidebarOpen"
        src="https://cdn.jsdelivr.net/npm/heroicons@2.0.16/24/outline/bars-3.svg"
        width="24"
        height="24"
        alt="Menu"
        :class="{ 'icon-dark': isDarkTheme }"
      />
      <img
        v-else
        src="https://cdn.jsdelivr.net/npm/heroicons@2.0.16/24/outline/x-mark.svg"
        width="24"
        height="24"
        alt="Close"
        :class="{ 'icon-dark': isDarkTheme }"
      />
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
import ResultadosBusqueda from '@/components/mapa/ResultadosBusqueda.vue'
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

const handleBuscarRuta = async ({ origen, destino }) => {
  limpiarBusqueda()
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

const handleRutaSeleccionada = async (rutaSugerida) => {
  try {
    const rutaGeoJSON = await fetchRutaPorId(rutaSugerida.routeId)

    datosDelViaje.value = {
      ...rutaSugerida,
      geoJson: rutaGeoJSON,
    }

    sugerenciasDeRuta.value = []
  } catch (error) {
    console.error('Error al obtener el GeoJSON de la ruta:', error)
    alert('No se pudo cargar el detalle de la ruta seleccionada.')
  }
}
const handleMostrarRuta = async (rutaId) => {
  try {
    limpiarBusqueda()

    const rutaGeoJSON = await fetchRutaPorId(rutaId)

    datosDelViaje.value = {
      routeId: rutaId,
      geoJson: rutaGeoJSON,
    }

    isSidebarOpen.value = false
  } catch (error) {
    console.error('Error al cargar la ruta:', error)
    alert('No se pudo cargar la ruta seleccionada.')
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
  top: 15px;
  left: 20px;
  z-index: 2001;
  background-color: white;
  border: none;
  border-radius: 12px;
  padding: 12px;
  width: 52px;
  height: 52px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.menu-button:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  background-color: rgba(255, 255, 255, 0.95);
}
.menu-button img {
  transition: filter 0.2s ease;
}

.menu-button img.icon-dark {
  filter: invert(1);
}

.map-view-container.theme-dark .menu-button {
  background-color: rgba(45, 45, 45, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.map-view-container.theme-dark .menu-button:hover {
  background-color: rgba(55, 55, 55, 0.95);
}

.menu-button.open {
  left: 230px;
}

@media (max-width: 768px) {
  .menu-button.open {
    left: calc(100vw - 72px);
  }
}

.menu-button.open.submenu-open {
  left: 300px;
}

@media (max-width: 768px) {
  .menu-button.open.submenu-open {
    left: calc(100vw - 72px);
  }
}

@media (max-width: 768px) {
  .menu-button {
    top: 16px;
    left: 16px;
    width: 48px;
    height: 48px;
    padding: 10px;
  }

  .menu-button svg {
    width: 20px;
    height: 20px;
  }
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
