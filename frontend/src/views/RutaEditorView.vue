<template>
  <div class="editor-container">
    <div class="view-header">
      <h2>{{ isEditing ? 'Editando Ruta' : 'Crear Nueva Ruta' }}</h2>
      <router-link to="/admin/rutas" class="btn-secundario">Volver a la lista</router-link>
    </div>

    <div class="tabs">
      <button class="tab-btn" :class="{ active: activeTab === 'upload' }" @click="activeTab = 'upload'">
        Subir Archivo
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'draw' }" @click="activeTab = 'draw'">
        Dibujar Manualmente
      </button>
    </div>

    <div class="tab-content">
      <div v-if="activeTab === 'upload'">
        <FileUpload @geojson-loaded="handleGeoJSONLoaded" />
      </div>
      <div v-if="activeTab === 'draw'">
        <p class="instruccion">Haz clic en el mapa para empezar a trazar la ruta. El mapa se centrará en Xalapa.</p>
        <div class="map-placeholder">
          Próximamente: Componente de mapa interactivo para dibujar.
        </div>
      </div>
    </div>

    <div v-if="rutaData.features[0].geometry.coordinates.length > 0" class="previsualizacion-y-form">
      <h3>Datos de la Ruta</h3>
      <div class="form-grid">
        <div class="form-group">
          <label for="ruta-nombre">Nombre de la Ruta</label>
          <input id="ruta-nombre" type="text" v-model="rutaData.features[0].properties.name" placeholder="Ej: Ruta 1: Centro - Tesorería" />
        </div>
        <div class="form-group">
          <label for="ruta-numero">Número de Ruta</label>
          <input id="ruta-numero" type="text" v-model="rutaData.numero_ruta" placeholder="Ej: 101" />
        </div>
        <div class="form-group full-width">
          <label for="ruta-desc">Descripción</label>
          <textarea id="ruta-desc" v-model="rutaData.features[0].properties.desc" placeholder="Añade una descripción breve de la ruta..."></textarea>
        </div>
      </div>
    </div>
    
    <div class="footer-actions">
      <button @click="handleSave" class="btn-primario" :disabled="!isSaveButtonEnabled">
        Guardar Ruta
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import FileUpload from '@/components/admin/FileUpload.vue';
import { mostrarAlertaExito, mostrarAlertaError } from '@/utils/alertas.js';

const route = useRoute();
const isEditing = computed(() => !!route.params.id);
const activeTab = ref('upload');

const rutaData = ref({
  numero_ruta: '',
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    properties: {
      name: '',
      desc: '',
    },
    geometry: {
      type: 'LineString',
      coordinates: []
    }
  }]
});

// CORRECCIÓN 4: Ruta de acceso correcta en la propiedad computada
const isSaveButtonEnabled = computed(() => {
  return rutaData.value.features[0].geometry.coordinates.length > 1 && rutaData.value.features[0].properties.name;
});

function handleGeoJSONLoaded(geojson) {
  try {
    const feature = geojson.features[0];
    if (!feature || feature.geometry.type !== 'LineString' || !feature.geometry.coordinates) {
      throw new Error('El archivo no tiene el formato GeoJSON de ruta esperado.');
    }
    
    rutaData.value.numero_ruta = geojson.ruta || '';
    rutaData.value.features[0].properties.name = feature.properties.name || '';
    rutaData.value.features[0].properties.desc = feature.properties.desc || '';
    rutaData.value.features[0].geometry.coordinates = feature.geometry.coordinates;

    mostrarAlertaExito('Archivo Cargado', 'Los datos del archivo se han previsualizado en el formulario.');

  } catch (error) {
    mostrarAlertaError('Error al procesar el archivo', error.message);
  }
}

function handleSave() {
  if (!isSaveButtonEnabled.value) {
    mostrarAlertaError('Datos incompletos', 'Asegúrate de que la ruta tenga un trazado y un nombre.');
    return;
  }
  console.log("Guardando datos de la ruta:", JSON.stringify(rutaData.value, null, 2));
  mostrarAlertaExito('¡Guardado!', 'La ruta se ha guardado correctamente (simulación).');
}
</script>

<style scoped>
.editor-container {
  max-width: 900px;
  margin: 0 auto;
}
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.btn-secundario {
  background-color: #ecf0f1;
  color: #34495e;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.2s;
}
.btn-secundario:hover {
  background-color: #dfe6e9;
}
.tabs {
  display: flex;
  border-bottom: 1px solid #e0e7ef;
  margin-bottom: 2rem;
}
.tab-btn {
  padding: 1rem 1.5rem;
  cursor: pointer;
  border: none;
  background: none;
  font-size: 1rem;
  font-weight: 600;
  color: #7f8c8d;
  position: relative;
  bottom: -1px;
}
.tab-btn.active {
  color: #3498db;
  border-bottom: 3px solid #3498db;
}
.instruccion {
  color: #7f8c8d;
  text-align: center;
  margin-bottom: 1rem;
}
.map-placeholder {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ecf0f1;
  border-radius: 12px;
  color: #95a5a6;
  font-style: italic;
}
.previsualizacion-y-form {
  margin-top: 2rem;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(44, 62, 80, 0.08);
}
.form-group {
  display: flex;
  flex-direction: column;
}
.form-group.full-width {
  grid-column: 1 / -1;
}
label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #34495e;
}
input, textarea {
  padding: 0.75rem;
  border: 1px solid #bdc3c7;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Montserrat', sans-serif;
}
textarea {
  min-height: 100px;
  resize: vertical;
}
.footer-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
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
.btn-primario:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}
</style>