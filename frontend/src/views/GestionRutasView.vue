<template>
  <div class="gestion-rutas-view">
    <div class="view-header">
      <div class="header-content">
        <h2>Añadir ruta al sistema</h2>
        <p class="header-subtitle"></p>
      </div>
      <button @click="crearNuevaRuta" class="btn-primario">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>Nueva Ruta</span>
      </button>
    </div>

    <div class="search-container">
      <div class="search-wrapper">
        <svg
          class="search-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Buscar por nombre o número de ruta..."
          class="search-input"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="clear-btn"
          title="Limpiar búsqueda"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div v-if="searchQuery" class="search-results-info">
        Mostrando {{ rutasFiltradas.length }} de {{ rutas.length }} rutas
      </div>
    </div>

    <div v-if="cargando" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando rutas...</p>
    </div>

    <div v-else-if="rutasFiltradas.length > 0" class="rutas-list">
      <RutaCard
        v-for="ruta in rutasFiltradas"
        :key="ruta.id"
        :ruta="ruta"
        @editar="handleEditar"
        @eliminar="handleEliminar"
      />
    </div>

    <div v-else-if="searchQuery && rutasFiltradas.length === 0" class="empty-state">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="80"
        height="80"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        <line x1="8" y1="11" x2="14" y2="11"></line>
      </svg>
      <h3>No se encontraron resultados</h3>
      <p>
        No hay rutas que coincidan con "<strong>{{ searchQuery }}</strong
        >"
      </p>
      <button @click="searchQuery = ''" class="btn-secundario">Limpiar búsqueda</button>
    </div>

    <div v-else class="empty-state">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="80"
        height="80"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
      <h3>No hay rutas disponibles</h3>
      <button @click="crearNuevaRuta" class="btn-primario">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>Crear Primera Ruta</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import RutaCard from '@/components/admin/RutaCard.vue'
import {
  mostrarDialogoConfirmacion,
  mostrarAlertaExito,
  mostrarAlertaError,
} from '@/utils/alertas.js'
import { getRutas, eliminarRuta} from '@/services/api.js'

const router = useRouter()
const rutas = ref([])
const cargando = ref(true)
const searchQuery = ref('')

onMounted(async () => {
  try {
    const rutasDesdeAPI = await getRutas()
    rutas.value = rutasDesdeAPI.map((apiRuta) => ({
      id: apiRuta.id || apiRuta._id,
      nombre: apiRuta.name || `Ruta ${apiRuta.ruta || 'desconocida'}`,
      descripcion: apiRuta.desc || apiRuta.notes,
      numero_ruta: apiRuta.ruta || 'N/A',
      puntos_recorrido: apiRuta.features?.[0]?.geometry?.coordinates?.length || 0,
      image: apiRuta.image,
    }))
  } catch (error) {
    console.error('Error al cargar las rutas:', error)
    mostrarAlertaError('Error de Carga', 'No se pudieron obtener las rutas del servidor.')
  } finally {
    cargando.value = false
  }
})

const rutasFiltradas = computed(() => {
  if (!searchQuery.value) {
    return rutas.value
  }
  const lowerCaseQuery = searchQuery.value.toLowerCase()
  return rutas.value.filter((ruta) => {
    const nombreMatch = ruta.nombre.toLowerCase().includes(lowerCaseQuery)
    const numeroMatch = ruta.numero_ruta.toString().toLowerCase().includes(lowerCaseQuery)
    const descripcionMatch = ruta.descripcion?.toLowerCase().includes(lowerCaseQuery) || false
    return nombreMatch || numeroMatch || descripcionMatch
  })
})

function crearNuevaRuta() {
  router.push('/admin/rutas/crear')
}

function handleEditar(id) {
  router.push(`/admin/rutas/editar/${id}`)
}

async function handleEliminar(id) {
  const resultado = await mostrarDialogoConfirmacion(
    '¿Eliminar esta ruta?',
    'Esta acción no se puede deshacer. Se eliminarán la ruta y todas sus paradas.',
  )

  if (resultado.isConfirmed) {
    try {
      // Llama a la API para eliminar en el backend
      await eliminarRuta(id)

      // Si tiene éxito, actualiza la UI eliminando la tarjeta
      rutas.value = rutas.value.filter((r) => r.id !== id)

      mostrarAlertaExito('¡Eliminada!', 'La ruta ha sido eliminada correctamente.')
    } catch (error) {
      // Si falla, informa al usuario
      console.error('Error al eliminar la ruta:', error)
      mostrarAlertaError('Error de Eliminación', `No se pudo eliminar la ruta: ${error.message}`)
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');

.gestion-rutas-view {
  min-height: 100vh;
  font-family: 'Montserrat', sans-serif;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #667eea;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  color: white;
}

.header-content h2 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

.header-subtitle {
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
  font-size: 0.95rem;
}

.btn-primario {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: white;
  color: #667eea;
  border: none;
  padding: 0.9rem 1.8rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-family: 'Montserrat', sans-serif;
}

.btn-primario:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  background-color: #f8f9ff;
}

.btn-secundario {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Montserrat', sans-serif;
  margin-top: 1rem;
}

.btn-secundario:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
}

.search-container {
  margin-bottom: 2rem;
}

.search-wrapper {
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}

.search-icon {
  position: absolute;
  left: 1.2rem;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 1rem 3.5rem 1rem 3.5rem;
  font-family: 'Montserrat', sans-serif;
  font-size: 1rem;
  border: 2px solid #e0e7ef;
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
}

.clear-btn {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  color: #95a5a6;
  padding: 0.3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background-color: #ecf0f1;
  color: #7f8c8d;
}

.search-results-info {
  text-align: center;
  margin-top: 0.8rem;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #7f8c8d;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #ecf0f1;
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: #7f8c8d;
}

.empty-state svg {
  color: #bdc3c7;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  font-size: 1rem;
  margin: 0;
}

.rutas-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
  padding-bottom: 2rem;
}

@media (max-width: 768px) {
  .view-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .header-content h2 {
    font-size: 1.5rem;
  }

  .rutas-list {
    grid-template-columns: 1fr;
  }
}
</style>
