<template>
  <form @submit.prevent="handleSubmit">
    <div class="form-grid">
      <div class="form-group">
        <label for="geojson-ruta">Archivo GeoJSON de la Ruta</label>
        <input
          type="file"
          id="geojson-ruta"
          @change="handleFileChange($event, 'ruta')"
          accept=".geojson, .json, application/geo+json"
          required
        />
        <small>Contiene la línea del recorrido (LineString).</small>
      </div>

      <div class="form-group">
        <label for="geojson-paradas">Archivo GeoJSON de las Paradas</label>
        <input
          type="file"
          id="geojson-paradas"
          @change="handleFileChange($event, 'paradas')"
          accept=".geojson, .json, application/geo+json"
          required
        />
        <small>Contiene los puntos de las paradas (Points).</small>
      </div>
    </div>

    <div class="form-actions">
      <a href="https://geojson.io/" target="_blank" class="btn-secundario">
        Crear GeoJSON en geojson.io
      </a>
      <button type="submit" class="btn-primario" :disabled="cargando">
        {{ cargando ? 'Creando Ruta...' : 'Crear Ruta' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  cargando: Boolean,
});

const emit = defineEmits(['submit-ruta']);

const archivos = ref({
  rutaGeoJSONFile: null,
  paradasGeoJSONFile: null,
});

function handleFileChange(event, tipo) {
  const file = event.target.files[0];
  if (!file) return;

  if (tipo === 'ruta') {
    archivos.value.rutaGeoJSONFile = file;
  } else if (tipo === 'paradas') {
    archivos.value.paradasGeoJSONFile = file;
  }
}

function handleSubmit() {
  // Emitimos un evento con los objetos de archivo para que el padre los procese
  emit('submit-ruta', archivos.value);
}
</script>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #34495e;
}

.form-group input[type="file"] {
  border: 1px solid #bdc3c7;
  padding: 0.8rem;
  border-radius: 8px;
  font-family: inherit;
}

.form-group small {
  margin-top: 0.5rem;
  color: #7f8c8d;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2.5rem;
  border-top: 1px solid #e0e7ef;
  padding-top: 1.5rem;
}

.btn-primario, .btn-secundario {
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  transition: all 0.2s;
}

.btn-primario {
  background-color: #3498db;
  color: white;
}

.btn-primario:hover {
  background-color: #2980b9;
}

.btn-primario:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.btn-secundario {
  background-color: #ecf0f1;
  color: #34495e;
}

.btn-secundario:hover {
  background-color: #dbe0e2;
}
</style>