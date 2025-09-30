<template>
  <div>
    <div class="view-header">
      <h2>Gestión de Rutas</h2>
      <button @click="crearNuevaRuta" class="btn-primario">
        + Crear Nueva Ruta
      </button>
    </div>

    <div v-if="cargando" class="loading-state">Cargando rutas...</div>
    
    <div v-else-if="rutas.length > 0" class="rutas-list">
      <RutaCard 
        v-for="ruta in rutas" 
        :key="ruta.id" 
        :ruta="ruta"
        @editar="handleEditar"
        @eliminar="handleEliminar"
      />
    </div>

    <div v-else class="empty-state">
      <p>No se encontraron rutas en la base de datos. ¡Crea la primera!</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import RutaCard from '@/components/admin/RutaCard.vue';
import { mostrarDialogoConfirmacion, mostrarAlertaExito, mostrarAlertaError } from '@/utils/alertas.js';
import { getRutas } from '@/services/api.js';

const router = useRouter();
const rutas = ref([]);
const cargando = ref(true);

onMounted(async () => {
  try {
    const rutasReales = await getRutas();
    
    // CORRECCIÓN: Se añade un .filter() para ignorar rutas con datos incompletos
    rutas.value = rutasReales
      .filter(rutaDoc => rutaDoc.features && rutaDoc.features.length > 0)
      .map(rutaDoc => {
        // Ahora es seguro acceder a features[0] porque ya filtramos los casos problemáticos
        const feature = rutaDoc.features[0];
        const properties = feature.properties || {};
        const geometry = feature.geometry || {};

        return {
          id: rutaDoc._id,
          nombre: properties.name || 'Ruta sin nombre',
          descripcion: properties.desc || properties.notes,
          numero_ruta: rutaDoc.ruta,
          puntos_recorrido: geometry.coordinates ? geometry.coordinates.length : 0,
        };
      });

  } catch (error) {
    console.error("Error al cargar las rutas:", error);
    mostrarAlertaError('Error de Carga', 'No se pudieron obtener las rutas del servidor.');
  } finally {
    cargando.value = false;
  }
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
  margin-bottom: 2rem;
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
</style>