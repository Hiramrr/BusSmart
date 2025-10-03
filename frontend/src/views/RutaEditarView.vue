<template>
  <div class="editor-container">
    <div class="view-header">
      <h2>✏️ Editar Ruta</h2>
      <router-link to="/admin/rutas" class="btn-cancel">Cancelar y Volver</router-link>
    </div>

    <div v-if="cargandoRuta" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando información de la ruta...</p>
    </div>

    <div v-else-if="errorCarga" class="error-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <h3>Error al cargar la ruta</h3>
      <p>{{ errorCarga }}</p>
      <router-link to="/admin/rutas" class="btn-secundario">Volver al listado</router-link>
    </div>

    <div v-else class="editor-content">
      <!-- Información Básica -->
      <div class="info-section">
        <h3>📋 Información de la Ruta</h3>
        <div class="form-grid">
          <div class="form-group">
            <label for="ruta-nombre">Nombre de la Ruta *</label>
            <input 
              id="ruta-nombre" 
              type="text" 
              v-model="rutaEditada.features[0].properties.name" 
              placeholder="Ej: Centro - Tesorería"
              required
            />
          </div>

          <div class="form-group">
            <label for="ruta-numero">Número de Ruta *</label>
            <input 
              id="ruta-numero" 
              type="text" 
              v-model="rutaEditada.ruta" 
              placeholder="Ej: 104"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="ruta-desc">Descripción</label>
          <textarea 
            id="ruta-desc" 
            v-model="rutaEditada.features[0].properties.desc" 
            placeholder="Añade una descripción de la ruta..."
            rows="3"
          ></textarea>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label for="peak-am">Frecuencia Hora Pico AM (min)</label>
            <input 
              id="peak-am" 
              type="number" 
              v-model.number="rutaEditada.features[0].properties.peak_am" 
              placeholder="10"
              min="1"
            />
          </div>

          <div class="form-group">
            <label for="midday">Frecuencia Medio Día (min)</label>
            <input 
              id="midday" 
              type="number" 
              v-model.number="rutaEditada.features[0].properties.midday" 
              placeholder="10"
              min="1"
            />
          </div>

          <div class="form-group">
            <label for="peak-pm">Frecuencia Hora Pico PM (min)</label>
            <input 
              id="peak-pm" 
              type="number" 
              v-model.number="rutaEditada.features[0].properties.peak_pm" 
              placeholder="10"
              min="1"
            />
          </div>

          <div class="form-group">
            <label for="night">Frecuencia Nocturna (min)</label>
            <input 
              id="night" 
              type="number" 
              v-model.number="rutaEditada.features[0].properties.night" 
              placeholder="10"
              min="1"
            />
          </div>
        </div>
      </div>

      <!-- Editor de Coordenadas -->
      <div class="coordinates-section">
        <div class="section-header">
          <h3>🗺️ Coordenadas del Recorrido</h3>
          <div class="coordinates-actions">
            <button @click="toggleCoordinatesView" class="btn-toggle">
              {{ mostrarCoordenadasCompleto ? '📋 Vista Simple' : '🔍 Vista Completa' }}
            </button>
            <button @click="agregarCoordenada" class="btn-success">
              + Agregar Punto
            </button>
          </div>
        </div>

        <div class="coordinates-info">
          <span class="info-badge">
            📍 Total de puntos: {{ rutaEditada.features[0].geometry.coordinates.length }}
          </span>
          <span class="info-badge" v-if="coordenadaEditando !== null">
            ✏️ Editando punto {{ coordenadaEditando + 1 }}
          </span>
        </div>

        <div v-if="!mostrarCoordenadasCompleto" class="coordinates-simple">
          <div 
            v-for="(coord, index) in rutaEditada.features[0].geometry.coordinates" 
            :key="index"
            class="coordinate-item"
            :class="{ 'editing': coordenadaEditando === index }"
          >
            <div class="coordinate-number">{{ index + 1 }}</div>
            <div class="coordinate-values" v-if="coordenadaEditando !== index">
              <span class="coord-value">Lng: {{ coord[0].toFixed(5) }}</span>
              <span class="coord-value">Lat: {{ coord[1].toFixed(5) }}</span>
            </div>
            <div class="coordinate-edit" v-else>
              <input 
                type="number" 
                v-model.number="coord[0]" 
                step="0.00001"
                placeholder="Longitud"
              />
              <input 
                type="number" 
                v-model.number="coord[1]" 
                step="0.00001"
                placeholder="Latitud"
              />
            </div>
            <div class="coordinate-actions">
              <button 
                v-if="coordenadaEditando !== index"
                @click="editarCoordenada(index)" 
                class="btn-icon btn-edit"
                title="Editar"
              >
                ✏️
              </button>
              <button 
                v-else
                @click="guardarCoordenada" 
                class="btn-icon btn-save"
                title="Guardar"
              >
                ✓
              </button>
              <button 
                @click="eliminarCoordenada(index)" 
                class="btn-icon btn-delete"
                title="Eliminar"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>

        <div v-else class="coordinates-json">
          <div class="json-editor-header">
            <span>📝 Editor JSON de Coordenadas</span>
            <button @click="validarYAplicarJSON" class="btn-success">
              Aplicar Cambios
            </button>
          </div>
          <textarea 
            v-model="coordinatesJSON" 
            class="json-textarea"
            rows="15"
          ></textarea>
          <small class="json-help">
            Formato: [[lng, lat], [lng, lat], ...]<br>
            Ejemplo: [[-96.92898, 19.56234], [-96.92901, 19.56238]]
          </small>
        </div>
      </div>

      <!-- Información de Paradas -->
      <div class="paradas-section" v-if="paradasEditadas && paradasEditadas.features">
        <div class="section-header">
          <h3>🚏 Paradas de la Ruta</h3>
          <span class="info-badge">
            Total: {{ paradasEditadas.features.length }} paradas
          </span>
        </div>
        
        <div class="paradas-list">
          <div 
            v-for="(parada, index) in paradasEditadas.features" 
            :key="parada.properties.id"
            class="parada-item"
          >
            <div class="parada-info">
              <span class="parada-number">{{ index + 1 }}</span>
              <div class="parada-coords">
                <span>Lng: {{ parada.geometry.coordinates[0].toFixed(5) }}</span>
                <span>Lat: {{ parada.geometry.coordinates[1].toFixed(5) }}</span>
              </div>
            </div>
            <button 
              @click="eliminarParada(index)" 
              class="btn-icon btn-delete"
              title="Eliminar parada"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- Acciones Finales -->
      <div class="actions-section">
        <button @click="cancelar" class="btn-secundario">
          Cancelar Cambios
        </button>
        <button 
          @click="guardarCambios" 
          class="btn-primario"
          :disabled="guardando || !validarFormulario()"
        >
          {{ guardando ? 'Guardando...' : '💾 Guardar Cambios' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { mostrarAlertaExito, mostrarAlertaError, mostrarDialogoConfirmacion } from '@/utils/alertas.js';
import { obtenerRutaPorMongoId, editarRuta } from '@/services/api.js';

const route = useRoute();
const router = useRouter();

const cargandoRuta = ref(true);
const guardando = ref(false);
const errorCarga = ref(null);
const mostrarCoordenadasCompleto = ref(false);
const coordenadaEditando = ref(null);
const coordinatesJSON = ref('');

const rutaEditada = ref({
  type: "FeatureCollection",
  features: [{
    type: "Feature",
    properties: {
      id: '',
      name: '',
      desc: null,
      notes: null,
      peak_am: 10,
      midday: 10,
      peak_pm: 10,
      night: 10
    },
    geometry: {
      type: "LineString",
      coordinates: []
    }
  }],
  ruta: ""
});

const paradasEditadas = ref({
  type: "FeatureCollection",
  features: [],
  ruta: ""
});

const rutaOriginal = ref(null);

onMounted(async () => {
  const mongoId = route.params.id;
  
  if (!mongoId) {
    errorCarga.value = "No se proporcionó un ID de ruta válido.";
    cargandoRuta.value = false;
    return;
  }

  try {
    const rutaData = await obtenerRutaPorMongoId(mongoId);
    
    rutaEditada.value = JSON.parse(JSON.stringify(rutaData));
    rutaOriginal.value = JSON.parse(JSON.stringify(rutaData));
    
    coordinatesJSON.value = JSON.stringify(rutaEditada.value.features[0].geometry.coordinates, null, 2);
    
    // Aquí podrías cargar las paradas si tienes un endpoint
    // paradasEditadas.value = await obtenerParadasDeRuta(rutaEditada.value.ruta);
    
    cargandoRuta.value = false;
  } catch (error) {
    console.error('Error al cargar la ruta:', error);
    errorCarga.value = error.message || 'No se pudo cargar la información de la ruta';
    cargandoRuta.value = false;
  }
});

function validarFormulario() {
  return rutaEditada.value.ruta && 
         rutaEditada.value.features[0].properties.name &&
         rutaEditada.value.features[0].geometry.coordinates.length >= 2;
}

function editarCoordenada(index) {
  coordenadaEditando.value = index;
}

function guardarCoordenada() {
  coordenadaEditando.value = null;
}

function agregarCoordenada() {
  const ultimaCoordenada = rutaEditada.value.features[0].geometry.coordinates[
    rutaEditada.value.features[0].geometry.coordinates.length - 1
  ];
  
  const nuevaCoordenada = ultimaCoordenada 
    ? [ultimaCoordenada[0] + 0.0001, ultimaCoordenada[1] + 0.0001]
    : [-96.92898, 19.56234];
  
  rutaEditada.value.features[0].geometry.coordinates.push(nuevaCoordenada);
  coordenadaEditando.value = rutaEditada.value.features[0].geometry.coordinates.length - 1;
}

async function eliminarCoordenada(index) {
  if (rutaEditada.value.features[0].geometry.coordinates.length <= 2) {
    mostrarAlertaError('No se puede eliminar', 'Una ruta debe tener al menos 2 puntos.');
    return;
  }

  const resultado = await mostrarDialogoConfirmacion(
    '¿Eliminar este punto?',
    `Se eliminará el punto ${index + 1} de la ruta.`
  );

  if (resultado.isConfirmed) {
    rutaEditada.value.features[0].geometry.coordinates.splice(index, 1);
    if (coordenadaEditando.value === index) {
      coordenadaEditando.value = null;
    }
  }
}

function eliminarParada(index) {
  paradasEditadas.value.features.splice(index, 1);
}

function toggleCoordinatesView() {
  if (!mostrarCoordenadasCompleto.value) {
    coordinatesJSON.value = JSON.stringify(
      rutaEditada.value.features[0].geometry.coordinates, 
      null, 
      2
    );
  }
  mostrarCoordenadasCompleto.value = !mostrarCoordenadasCompleto.value;
}

function validarYAplicarJSON() {
  try {
    const parsed = JSON.parse(coordinatesJSON.value);
    
    if (!Array.isArray(parsed)) {
      throw new Error('El JSON debe ser un array');
    }
    
    if (parsed.length < 2) {
      throw new Error('Debe haber al menos 2 coordenadas');
    }
    
    for (let i = 0; i < parsed.length; i++) {
      if (!Array.isArray(parsed[i]) || parsed[i].length !== 2) {
        throw new Error(`Coordenada ${i + 1} inválida`);
      }
      if (typeof parsed[i][0] !== 'number' || typeof parsed[i][1] !== 'number') {
        throw new Error(`Coordenada ${i + 1} debe contener números`);
      }
    }
    
    rutaEditada.value.features[0].geometry.coordinates = parsed;
    mostrarCoordenadasCompleto.value = false;
    mostrarAlertaExito('¡Aplicado!', 'Las coordenadas se han actualizado correctamente.');
    
  } catch (error) {
    mostrarAlertaError('JSON Inválido', error.message);
  }
}

async function guardarCambios() {
  const resultado = await mostrarDialogoConfirmacion(
    '¿Guardar cambios?',
    'Se actualizará la información de la ruta en la base de datos.'
  );

  if (!resultado.isConfirmed) return;

  guardando.value = true;

  try {
    const mongoId = route.params.id;
    await editarRuta(mongoId, rutaEditada.value, paradasEditadas.value);

    mostrarAlertaExito('¡Guardado!', 'La ruta se ha actualizado correctamente.');
    router.push('/admin/rutas');
    
  } catch (error) {
    console.error('Error al guardar:', error);
    mostrarAlertaError('Error al Guardar', error.message || 'No se pudieron guardar los cambios.');
  } finally {
    guardando.value = false;
  }
}

async function cancelar() {
  const resultado = await mostrarDialogoConfirmacion(
    '¿Cancelar edición?',
    'Los cambios no guardados se perderán.'
  );

  if (resultado.isConfirmed) {
    router.push('/admin/rutas');
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');

.editor-container {
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Montserrat', sans-serif;
  padding-bottom: 4rem;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  color: white;
}

.view-header h2 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
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
  to { transform: rotate(360deg); }
}

.error-state svg {
  color: #e74c3c;
  margin-bottom: 1rem;
}

.error-state h3 {
  color: #2c3e50;
  margin: 0.5rem 0;
}

.editor-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-section, .coordinates-section, .paradas-section {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e0e7ef;
}

.section-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #34495e;
  font-size: 0.95rem;
}

.form-group input,
.form-group textarea {
  padding: 0.75rem;
  border: 2px solid #e0e7ef;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.coordinates-actions {
  display: flex;
  gap: 0.75rem;
}

.coordinates-info {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #e3f0ff 0%, #f9f9f9 100%);
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #2c3e50;
}

.coordinates-simple {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.coordinate-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border: 2px solid #e0e7ef;
  border-radius: 10px;
  transition: all 0.2s;
}

.coordinate-item.editing {
  border-color: #667eea;
  background: #f0f4ff;
}

.coordinate-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  border-radius: 50%;
  font-weight: 700;
  flex-shrink: 0;
}

.coordinate-values {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.coord-value {
  font-size: 0.9rem;
  color: #555;
  font-family: 'Courier New', monospace;
}

.coordinate-edit {
  flex: 1;
  display: flex;
  gap: 0.5rem;
}

.coordinate-edit input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #bdc3c7;
  border-radius: 6px;
  font-size: 0.85rem;
  font-family: 'Courier New', monospace;
}

.coordinate-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: rgba(0, 0, 0, 0.05);
}

.btn-edit:hover { background: rgba(52, 152, 219, 0.1); }
.btn-save:hover { background: rgba(46, 204, 113, 0.1); }
.btn-delete:hover { background: rgba(231, 76, 60, 0.1); }

.coordinates-json {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.json-editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #34495e;
  color: white;
  border-radius: 8px 8px 0 0;
  font-weight: 600;
}

.json-textarea {
  width: 100%;
  padding: 1rem;
  background: #2c3e50;
  color: #ecf0f1;
  border: none;
  border-radius: 0 0 8px 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  resize: vertical;
}

.json-help {
  color: #7f8c8d;
  font-size: 0.85rem;
  line-height: 1.6;
}

.paradas-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.parada-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border: 1px solid #e0e7ef;
  border-radius: 10px;
}

.parada-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.parada-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.9rem;
}

.parada-coords {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
  font-family: 'Courier New', monospace;
  color: #555;
}

.actions-section {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.btn-primario, .btn-secundario, .btn-success, .btn-cancel, .btn-toggle {
  border: none;
  padding: 0.9rem 1.8rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Montserrat', sans-serif;
}

.btn-primario {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primario:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.btn-primario:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secundario {
  background: #ecf0f1;
  color: #34495e;
}

.btn-secundario:hover {
  background: #dfe6e9;
}

.btn-success {
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(46, 204, 113, 0.4);
}

.btn-cancel {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.btn-cancel:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(231, 76, 60, 0.4);
}

.btn-toggle {
  background: #3498db;
  color: white;
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
}

.btn-toggle:hover {
  background: #2980b9;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .coordinates-simple {
    grid-template-columns: 1fr;
  }

  .actions-section {
    flex-direction: column;
  }
}
</style>
