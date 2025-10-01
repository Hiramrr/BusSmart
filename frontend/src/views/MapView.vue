<template>
  <div class="map-view-container">
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
      />
      <img
        v-else
        src="https://cdn.jsdelivr.net/npm/heroicons@2.0.16/24/outline/x-mark.svg"
        width="24"
        height="24"
        alt="Close"
      />
    </button>
    <div class="sidebar-overlay" :class="{ active: isSidebarOpen }" @click="toggleSidebar"></div>

    <MenuLateral
      :is-open="isSidebarOpen"
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

      <MapaContenedor :datosViaje="datosDelViaje" @ruta-limpiada="limpiarBusqueda" />
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
import { mostrarAlertaError } from '@/utils/alertas.js'

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
  puntoDeOrigen.value = null
  puntoDeDestino.value = null
}

const handleBuscarRuta = async ({ origen, destino }) => {
  limpiarBusqueda()
  // Guardamos el origen y destino en este componente
  puntoDeOrigen.value = origen
  puntoDeDestino.value = destino

  console.log('Buscando rutas para:', { origen, destino })
  try {
    const sugerencias = await fetchSugerenciasDeRuta(origen, destino)
    if (sugerencias.length === 0) {
      mostrarAlertaError(
        'Sin rutas',
        'No se encontraron rutas directas para tu viaje. Intenta con puntos de referencia más cercanos a las avenidas principales.',
      )
    }
    sugerenciasDeRuta.value = sugerencias
  } catch (error) {
    console.error('Error al obtener sugerencias:', error)
    mostrarAlertaError(
      'Hubo un problema',
      'Hubo un problema al buscar las rutas. Por favor, inténtalo de nuevo.',
    )
  }
}

const handleRutaSeleccionada = async (rutaSugerida) => {
  try {
    const rutaGeoJSON = await fetchRutaPorId(rutaSugerida.routeId)

    // Creamos el objeto unificado para el mapa
    datosDelViaje.value = {
      ...rutaSugerida,
      geoJson: rutaGeoJSON,
      origenUsuario: puntoDeOrigen.value, // Añadimos el origen del usuario
      destinoUsuario: puntoDeDestino.value, // Añadimos el destino del usuario
    }

    sugerenciasDeRuta.value = []
  } catch (error) {
    console.error('Error al obtener el GeoJSON de la ruta:', error)
    mostrarAlertaError('Error', 'No se pudo cargar el detalle de la ruta seleccionada.')
  }
}

const handleMostrarRuta = async (rutaId) => {
  try {
    limpiarBusqueda()
    const rutaGeoJSON = await fetchRutaPorId(rutaId)

    // Para las rutas del menú, no hay origen/destino de usuario
    datosDelViaje.value = {
      routeId: rutaId,
      geoJson: rutaGeoJSON,
    }

    isSidebarOpen.value = false
  } catch (error) {
    console.error('Error al cargar la ruta:', error)
    mostrarAlertaError('Error', 'No se pudo cargar la ruta seleccionada.')
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
  /* La transición 'all' es suficiente para animar el cambio en 'left' */
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

.menu-button.open {
  left: 230px;
}

/* CORRECCIÓN:
  Cuando el submenú se abre, el botón se posiciona a 310px desde la izquierda.
  Esto lo coloca justo al lado del menú principal (que mide 300px),
  creando el efecto deseado.
*/
.menu-button.open.submenu-open {
  left: 400px; /* Ajustado para estar a la derecha del menú lateral de 300px */
  height: 40px;
  width: 40px;
  background-color: rgb(222, 143, 143);
}

@media (max-width: 768px) {
  .menu-button {
    top: 16px;
    left: 16px;
    width: 48px;
    height: 48px;
    padding: 10px;
  }

  .menu-button.open {
    left: calc(100vw - 64px); /* Se mantiene tu lógica para móvil */
  }

  .menu-button.open.submenu-open {
    left: calc(100vw - 64px); /* En móvil, se queda en la misma posición final */
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
