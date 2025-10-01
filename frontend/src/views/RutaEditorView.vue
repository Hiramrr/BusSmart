<template>
  <div class="editor-container">
    <div class="view-header">
      <h2>{{ isEditing ? 'Editando Ruta' : 'Crear Nueva Ruta' }}</h2>
      <router-link to="/admin/rutas" class="btn-cancel">Cancelar y Volver</router-link>
    </div>

    <div class="tabs">
      <button class="tab-btn" :class="{ active: activeTab === 'upload' }" @click="activeTab = 'upload'">
        <span class="icon">📁</span> Subir Archivo
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'draw' }" @click="activeTab = 'draw'">
        <span class="icon">✏️</span> Dibujar Manualmente
      </button>
    </div>

    <div class="tab-content">
      <div v-show="activeTab === 'upload'">
        <FileUpload @geojson-loaded="handleGeoJSONLoaded" />
      </div>

      <div v-show="activeTab === 'draw'" class="wizard-container">
        
        <div class="stepper">
          <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
            <div class="step-number">1</div><div class="step-label">Trazar Ruta</div>
          </div>
          <div class="step-connector"></div>
          <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
            <div class="step-number">2</div><div class="step-label">Añadir Paradas</div>
          </div>
          <div class="step-connector"></div>
          <div class="step" :class="{ active: currentStep === 3 }">
            <div class="step-number">3</div><div class="step-label">Revisar y Guardar</div>
          </div>
        </div>

        <div v-if="currentStep === 1" class="step-content">
          <div class="editor-layout">
            <div class="map-area">
              <MapDrawer ref="mapDrawer" mode="route" @point-added="addRouteCoordinate" />
            </div>
            <div class="controls-area">
              <h3>Datos de la Ruta</h3>
              <div class="form-group">
                <label for="ruta-nombre">Nombre de la Ruta</label>
                <input id="ruta-nombre" type="text" v-model="nuevaRuta.features[0].properties.name" placeholder="Ej: Centro - Tesorería" />
              </div>
              <div class="form-group">
                <label for="ruta-numero">Número de Ruta</label>
                <input id="ruta-numero" type="text" v-model="nuevaRuta.ruta" placeholder="Ej: 104" />
              </div>
              <div class="form-group">
                <label for="ruta-desc">Descripción (opcional)</label>
                <textarea id="ruta-desc" v-model="nuevaRuta.features[0].properties.desc" placeholder="Añade una descripción..."></textarea>
              </div>
              <h4>Controles de Dibujo</h4>
              <div class="drawing-controls">
                <button @click="undoLastPoint" class="btn-secundario">Deshacer Punto</button>
                <button @click="clearCurrentMap" class="btn-danger">Limpiar Trazado</button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="currentStep === 2" class="step-content">
          <div class="editor-layout">
            <div class="map-area">
               <MapDrawer ref="mapDrawer" mode="stops" :route-coordinates="nuevaRuta.features[0].geometry.coordinates" @point-added="addStopFeature" />
            </div>
            <div class="controls-area">
              <h3>Paradas de la Ruta</h3>
              <p class="instruccion-paradas">Haz clic en el mapa para añadir paradas en orden.</p>
              <div class="stops-list">
                <div v-for="(stop, index) in nuevasParadas.features" :key="stop.properties.id" class="stop-item">
                  <span>Parada {{ index + 1 }}</span>
                  <button @click="removeStop(index)" class="delete-stop-btn" title="Eliminar parada">✖</button>
                </div>
                 <div v-if="!nuevasParadas.features.length" class="no-stops">Aún no hay paradas.</div>
              </div>
               <h4>Controles de Dibujo</h4>
              <div class="drawing-controls">
                <button @click="undoLastPoint" class="btn-secundario">Deshacer Parada</button>
                <button @click="clearCurrentMap" class="btn-danger">Limpiar Paradas</button>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="currentStep === 3" class="step-content">
            <h3>Revisión Final</h3>
            <p>Verifica los datos generados antes de guardar. Aún puedes volver atrás para hacer cambios.</p>
            <div class="review-grid">
                <div class="json-preview">
                    <h4>GeoJSON de la Ruta</h4>
                    <pre>{{ JSON.stringify(getFinalRutaJson(), null, 2) }}</pre>
                </div>
                <div class="json-preview">
                    <h4>GeoJSON de las Paradas</h4>
                    <pre>{{ JSON.stringify(getFinalParadasJson(), null, 2) }}</pre>
                </div>
            </div>
        </div>

        <div class="wizard-navigation">
          <button v-if="currentStep > 1" @click="prevStep" class="btn-secundario">Atrás</button>
          <div class="espaciador"></div>
          <button v-if="currentStep < 3" @click="nextStep" class="btn-success" :disabled="!isNextStepEnabled">Siguiente</button>
          <button v-if="currentStep === 3" @click="handleSave" class="btn-primario">Confirmar y Guardar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// ... (LA SECCIÓN SCRIPT NO TIENE CAMBIOS) ...
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import FileUpload from '@/components/admin/FileUpload.vue';
import MapDrawer from '@/components/admin/MapDrawer.vue';
import { mostrarAlertaExito, mostrarAlertaError } from '@/utils/alertas.js';

const route = useRoute();
const isEditing = computed(() => !!route.params.id);
const activeTab = ref('draw');

const currentStep = ref(1);
const mapDrawer = ref(null);

const nuevaRuta = ref({
  type: "FeatureCollection",
  features: [{
    type: "Feature",
    properties: { id: '', name: '', desc: null, notes: null, peak_am: null, midday: null, peak_pm: null, night: null },
    geometry: { type: "LineString", coordinates: [] }
  }],
  ruta: ""
});

const nuevasParadas = ref({
  type: "FeatureCollection",
  features: [],
  ruta: ""
});

watch(() => nuevaRuta.value.ruta, (newVal) => {
  nuevasParadas.value.ruta = newVal;
});

const isNextStepEnabled = computed(() => {
  if (currentStep.value === 1) {
    return nuevaRuta.value.features[0].geometry.coordinates.length >= 2 && nuevaRuta.value.ruta && nuevaRuta.value.features[0].properties.name;
  }
  if (currentStep.value === 2) {
    return nuevasParadas.value.features.length > 0;
  }
  return false;
});

function nextStep() {
  if (isNextStepEnabled.value) {
    currentStep.value++;
  } else {
    mostrarAlertaError('Datos incompletos', 'Por favor, completa los campos obligatorios y el trazado para continuar.');
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

function addRouteCoordinate(coords) {
  nuevaRuta.value.features[0].geometry.coordinates.push(coords);
}

function addStopFeature(coords) {
  const routeId = nuevaRuta.value.features[0].properties.id || (nuevaRuta.value.features[0].properties.id = Date.now().toString());
  const sequence = nuevasParadas.value.features.length;

  nuevasParadas.value.features.push({
    type: "Feature",
    properties: {
      id: `${routeId}-${sequence}`,
      routeId: routeId,
      sequence: sequence,
      travelTime: null, dwellTime: null, arrivalTim: null, departureT: null, passengerA: null, passengerB: null,
    },
    geometry: {
      type: "Point",
      coordinates: coords
    }
  });
}

function undoLastPoint() {
  if (mapDrawer.value?.undoLastPoint()) {
    if (currentStep.value === 1) {
      nuevaRuta.value.features[0].geometry.coordinates.pop();
    } else if (currentStep.value === 2) {
      nuevasParadas.value.features.pop();
    }
  }
}

function removeStop(index) {
    nuevasParadas.value.features.splice(index, 1);
}

function clearCurrentMap() {
    if (mapDrawer.value) {
        mapDrawer.value.clearMap();
        if (currentStep.value === 1) {
            nuevaRuta.value.features[0].geometry.coordinates = [];
        } else if (currentStep.value === 2) {
            nuevasParadas.value.features = [];
        }
    }
}

function getFinalRutaJson() {
    const finalRuta = JSON.parse(JSON.stringify(nuevaRuta.value));
    if (!finalRuta.features[0].properties.id) {
        finalRuta.features[0].properties.id = Date.now().toString();
    }
    return finalRuta;
}

function getFinalParadasJson() {
    const finalParadas = JSON.parse(JSON.stringify(nuevasParadas.value));
    const routeId = nuevaRuta.value.features[0].properties.id;
    finalParadas.features.forEach((feature, index) => {
        feature.properties.routeId = routeId;
        feature.properties.sequence = index;
    });
    return finalParadas;
}

function handleSave() {
  const rutaFinal = getFinalRutaJson();
  const paradasFinales = getFinalParadasJson();

  console.log("----- GEOJSON DE RUTA PARA ENVIAR -----", JSON.stringify(rutaFinal, null, 2));
  console.log("----- GEOJSON DE PARADAS PARA ENVIAR -----", JSON.stringify(paradasFinales, null, 2));

  mostrarAlertaExito('¡GeoJSON Generado!', 'Revisa la consola para ver los objetos que se enviarían al servidor.');
}

function handleGeoJSONLoaded(geojson) {
    // Implementación futura
}
</script>

<style scoped>
.editor-container {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 4rem;
}
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e7ef;
}

/* --- NUEVOS ESTILOS DE BOTONES --- */
.btn-primario, .btn-secundario, .btn-success, .btn-danger, .btn-cancel {
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}
.btn-primario { background-color: #3498db; color: white; }
.btn-primario:hover { background-color: #2980b9; }
.btn-primario:disabled { background-color: #bdc3c7; cursor: not-allowed; }

.btn-success { background-color: #2ecc71; color: white; }
.btn-success:hover { background-color: #27ae60; }
.btn-success:disabled { background-color: #bdc3c7; cursor: not-allowed; }

.btn-secundario { background-color: #ecf0f1; color: #34495e; }
.btn-secundario:hover { background-color: #dfe6e9; }

/* Botón rojo para Cancelar y Salir */
.btn-cancel { background-color: #e74c3c; color: white; }
.btn-cancel:hover { background-color: #c0392b; }

/* Botón de advertencia/peligro para Limpiar */
.btn-danger { background-color: #f1c40f; color: #34495e; }
.btn-danger:hover { background-color: #f39c12; }


/* --- ESTILOS GENERALES (Sin cambios) --- */
.tabs { display: flex; border-bottom: 2px solid #e0e7ef; margin-bottom: 2rem; }
.tab-btn {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 1rem 1.5rem; cursor: pointer;
  border: none; background: none; font-size: 1.1rem;
  font-weight: 600; color: #7f8c8d;
  position: relative; bottom: -2px;
  border-bottom: 3px solid transparent;
}
.tab-btn .icon { font-size: 1.2rem; }
.tab-btn.active { color: #3498db; border-bottom-color: #3498db; }
.wizard-container { padding: 1rem 0; }
.stepper {
  display: flex; align-items: center; justify-content: space-between;
  width: 80%; margin: 0 auto 3rem auto;
}
.step {
  display: flex; flex-direction: column; align-items: center;
  gap: 0.5rem; color: #95a5a6; text-align: center;
}
.step.active .step-label { color: #3498db; font-weight: 600; }
.step-number {
  width: 36px; height: 36px; border-radius: 50%;
  background-color: #ecf0f1; display: flex; align-items: center; justify-content: center;
  border: 2px solid #bdc3c7; font-weight: 600; transition: all 0.3s ease;
}
.step.active .step-number { background-color: #3498db; border-color: #3498db; color: white; }
.step.completed .step-number { background-color: #2ecc71; border-color: #2ecc71; color: white; }
.step-connector { flex-grow: 1; height: 3px; background-color: #e0e7ef; }
.step.completed ~ .step-connector, .step.completed ~ .step.active .step-connector { background-color: #2ecc71; }
.editor-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
.map-area { min-width: 0; background-color: #f4f7f9; border-radius: 12px; }
.controls-area {
  background: #fdfdfd; padding: 1.5rem; border-radius: 12px;
  border: 1px solid #e0e7ef; display: flex; flex-direction: column; gap: 1.5rem;
}
.controls-area h3, .controls-area h4 {
    margin: 0; color: #2c3e50;
    border-bottom: 1px solid #e0e7ef; padding-bottom: 0.75rem;
}
.form-group { display: flex; flex-direction: column; }
label { margin-bottom: 0.5rem; font-weight: 600; color: #34495e; font-size: 0.9rem; }
input, textarea {
  padding: 0.75rem; border: 1px solid #bdc3c7; border-radius: 8px;
  font-size: 1rem; font-family: 'Montserrat', sans-serif;
  transition: border-color 0.2s, box-shadow 0.2s;
}
input:focus, textarea:focus {
    outline: none; border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}
textarea { min-height: 80px; resize: vertical; }
.drawing-controls { display: flex; gap: 1rem; flex-wrap: wrap; }
.wizard-navigation {
  display: flex; justify-content: flex-end; gap: 1rem;
  margin-top: 2rem; border-top: 1px solid #e0e7ef; padding-top: 1.5rem;
}
.wizard-navigation .espaciador { flex-grow: 1; }
.review-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.json-preview {
    background-color: #2c3e50; color: #ecf0f1;
    border-radius: 8px; padding: 1.5rem;
}
pre {
    white-space: pre-wrap; word-wrap: break-word; font-size: 0.85rem;
    max-height: 450px; overflow-y: auto; background-color: #34495e;
    padding: 1rem; border-radius: 6px;
}
.instruccion-paradas, .no-stops {
    font-size: 0.9rem; color: #7f8c8d; text-align: center;
    padding: 1rem; background-color: #f8f9f9; border-radius: 8px;
}
.stops-list {
    display: flex; flex-direction: column; gap: 0.75rem;
    max-height: 250px; overflow-y: auto; padding-right: 0.5rem;
}
.stop-item {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0.75rem 1rem; background: #fff;
    border: 1px solid #e0e7ef; border-radius: 8px; font-weight: 500;
}
.delete-stop-btn {
    background: none; border: none; color: #e74c3c;
    cursor: pointer; font-size: 1.4rem; line-height: 1;
}
</style>