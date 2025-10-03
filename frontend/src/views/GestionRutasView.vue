<template>
  <div>
    <div class="view-header">
      <h2>Gestión de Rutas</h2>
      <button @click="crearNuevaRuta" class="btn-primario">
        + Crear Nueva Ruta
      </button>
    </div>

    <div class="search-container">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="🔍️ Buscar por nombre o número de ruta 🔍️..." 
        class="search-input"
      />
    </div>

    <div v-if="cargando" class="loading-state">Cargando rutas...</div>
    
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
      <p>No se encontraron rutas que coincidan con tu búsqueda.</p>
    </div>
    
    <div v-else class="empty-state">
      <p>No se encontraron rutas en la base de datos. ¡Crea la primera!</p>
    </div>
  </div>
</template>

<script setup>
// 1. Importar 'ref' y 'computed'
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import RutaCard from '@/components/admin/RutaCard.vue';
import { mostrarDialogoConfirmacion, mostrarAlertaExito, mostrarAlertaError } from '@/utils/alertas.js';
import { getRutas } from '@/services/api.js';

const router = useRouter();
const rutas = ref([]);
const cargando = ref(true);
// 2. Crear una referencia para el término de búsqueda
const searchQuery = ref('');

onMounted(async () => {
  try {
    const rutasDesdeAPI = await getRutas();
    rutas.value = rutasDesdeAPI.map(apiRuta => ({
      id: apiRuta.id || apiRuta._id,
      nombre: apiRuta.name || `Ruta ${apiRuta.ruta || 'desconocida'}`,
      descripcion: apiRuta.desc || apiRuta.notes,
      numero_ruta: apiRuta.ruta || 'N/A',
      puntos_recorrido: apiRuta.features?.[0]?.geometry?.coordinates?.length || 0,
      image: apiRuta.image,
    }));
  } catch (error) {
    console.error("Error al cargar las rutas:", error);
    mostrarAlertaError('Error de Carga', 'No se pudieron obtener las rutas del servidor.');
  } finally {
    cargando.value = false;
  }
});

// 3. Crear una propiedad computada para filtrar las rutas
const rutasFiltradas = computed(() => {
  if (!searchQuery.value) {
    return rutas.value;
  }
  const lowerCaseQuery = searchQuery.value.toLowerCase();
  return rutas.value.filter(ruta => {
    const nombreMatch = ruta.nombre.toLowerCase().includes(lowerCaseQuery);
    const numeroMatch = ruta.numero_ruta.toString().toLowerCase().includes(lowerCaseQuery);
    return nombreMatch || numeroMatch;
  });
});

function crearNuevaRuta() {
  router.push('/admin/rutas/crear');
}

function handleEditar(id) {
  router.push(`/admin/rutas/editar/${id}`);
}

async function handleEliminar(id) {
  const resultado = await mostrarDialogoConfirmacion(
    '¿Estás seguro de eliminar esta ruta?',
    'Esta acción no se puede deshacer.'
  );

  if (resultado.isConfirmed) {
    console.log(`Simulando la eliminación de la ruta con ID: ${id}`);
    // También eliminamos de la lista original para que el filtro se mantenga consistente
    rutas.value = rutas.value.filter(r => r.id !== id);
    mostrarAlertaExito('¡Eliminada!', 'La ruta ha sido eliminada correctamente.');
  }
}
</script>

<style scoped>
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

/* --- ESTILOS AÑADIDOS PARA LA BÚSQUEDA --- */
.search-container {
  display: flex;
  justify-content: center;
  margin-bottom: 2.5rem; /* Espacio extra */
}

.search-input {
  width: 100%;
  max-width: 500px; /* Ancho máximo */
  padding: 0.8rem 1.5rem;
  font-family: 'Montserrat', sans-serif; /* Para el ícono */
  font-size: 1rem;
  border: 1px solid #e0e7ef;
  border-radius: 2rem; /* Bordes redondeados */
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: all 0.2s ease-in-out;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
}

.btn-primario {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-primario:hover {
  background-color: #2980b9;
}
.loading-state, .empty-state {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
}
.rutas-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}
</style>