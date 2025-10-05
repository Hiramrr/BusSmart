<template>
  <div class="editor-container">
    <div class="view-header">
      <h2>{{ isEditing ? '✏️ Editando Ruta' : '➕ Crear Nueva Ruta' }}</h2>
      <router-link to="/admin/rutas" class="btn-cancel">Cancelar y Volver</router-link>
    </div>

    <!-- Indicador de carga -->
    <div v-if="cargandoRuta" class="loading-overlay">
      <div class="spinner"></div>
      <p>Cargando ruta...</p>
    </div>

    <div v-else class="tabs">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'upload' }"
        @click="activeTab = 'upload'"
      >
        <span class="icon">📁</span> Subir Archivo
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'draw' }" @click="activeTab = 'draw'">
        <span class="icon">✏️</span> {{ isEditing ? 'Editar en Mapa' : 'Dibujar Manualmente' }}
      </button>
    </div>

    <div class="tab-content">
      <div v-show="activeTab === 'upload'">
        <FileUpload @geojson-loaded="handleGeoJSONLoaded" />
      </div>

      <div v-show="activeTab === 'draw'" class="wizard-container">
        <div class="stepper">
          <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
            <div class="step-number">1</div>
            <div class="step-label">{{ isEditing ? 'Editar' : 'Trazar' }} Ruta</div>
          </div>
          <div class="step-connector"></div>
          <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
            <div class="step-number">2</div>
            <div class="step-label">{{ isEditing ? 'Editar' : 'Añadir' }} Paradas</div>
          </div>
          <div class="step-connector"></div>
          <div class="step" :class="{ active: currentStep === 3 }">
            <div class="step-number">3</div>
            <div class="step-label">Revisar y Guardar</div>
          </div>
        </div>

        <!-- PASO 1: Editar/Crear Ruta -->
        <div v-if="currentStep === 1" class="step-content">
          <div class="editor-layout">
            <div class="map-area">
              <MapEditor
                ref="mapEditor"
                mode="route"
                :initial-coordinates="nuevaRuta.features[0].geometry.coordinates"
                @coordinates-updated="handleCoordinatesUpdate"
              />
            </div>
            <div class="controls-area">
              <h3>Datos de la Ruta</h3>
              <div class="form-group">
                <label for="ruta-nombre">Nombre de la Ruta *</label>
                <input
                  id="ruta-nombre"
                  type="text"
                  v-model="nuevaRuta.features[0].properties.name"
                  placeholder="Ej: Centro - Tesorería"
                />
              </div>
              <div class="form-group">
                <label for="ruta-numero">Número de Ruta *</label>
                <input
                  id="ruta-numero"
                  type="text"
                  v-model="nuevaRuta.ruta"
                  placeholder="Ej: 104"
                />
              </div>
              <div class="form-group">
                <label for="ruta-desc">Descripción</label>
                <textarea
                  id="ruta-desc"
                  v-model="nuevaRuta.features[0].properties.desc"
                  placeholder="Añade una descripción..."
                ></textarea>
              </div>
              <div class="form-group">
                <label for="ruta-image">Ruta de Imagen</label>
                <input
                  id="ruta-image"
                  type="text"
                  v-model="nuevaRuta.image"
                  placeholder="/images/104/imagen/bus.jpg"
                />
              </div>

              <!-- Frecuencias -->
              <h4>⏰ Frecuencias (minutos)</h4>
              <div class="frequency-grid">
                <div class="frequency-item">
                  <label>🌅 Pico AM</label>
                  <input
                    type="number"
                    v-model.number="nuevaRuta.features[0].properties.peak_am"
                    min="1"
                  />
                </div>
                <div class="frequency-item">
                  <label>☀️ Mediodía</label>
                  <input
                    type="number"
                    v-model.number="nuevaRuta.features[0].properties.midday"
                    min="1"
                  />
                </div>
                <div class="frequency-item">
                  <label>🌆 Pico PM</label>
                  <input
                    type="number"
                    v-model.number="nuevaRuta.features[0].properties.peak_pm"
                    min="1"
                  />
                </div>
                <div class="frequency-item">
                  <label>🌙 Noche</label>
                  <input
                    type="number"
                    v-model.number="nuevaRuta.features[0].properties.night"
                    min="1"
                  />
                </div>
              </div>

              <h4>Controles de Edición</h4>
              <div class="info-box">
                <p><strong>💡 Consejos:</strong></p>
                <ul>
                  <li>Haz clic en el mapa para agregar puntos</li>
                  <li>Arrastra los puntos para moverlos</li>
                  <li>Clic derecho para eliminar un punto</li>
                </ul>
              </div>
              <div class="drawing-controls">
                <button @click="undoLastPoint" class="btn-secundario">↶ Deshacer Punto</button>
                <button @click="clearCurrentMap" class="btn-danger">🗑️ Limpiar Todo</button>
              </div>
              <div class="stats-box">
                <span class="stat-item"
                  >📍 {{ nuevaRuta.features[0].geometry.coordinates.length }} puntos</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- PASO 2: Editar/Crear Paradas -->
        <div v-if="currentStep === 2" class="step-content">
          <div class="editor-layout">
            <div class="map-area">
              <MapEditor
                ref="mapEditor"
                mode="stops"
                :initial-coordinates="nuevaRuta.features[0].geometry.coordinates"
                :initial-stops="nuevasParadas.features"
                @stops-updated="handleStopsUpdate"
              />
            </div>
            <div class="controls-area">
              <h3>Paradas de la Ruta</h3>
              <div class="info-box">
                <p><strong>💡 Consejos:</strong></p>
                <ul>
                  <li>Haz clic en el mapa para agregar paradas</li>
                  <li>Arrastra las paradas para moverlas</li>
                  <li>Clic derecho para eliminar una parada</li>
                  <li>Las paradas se numeran automáticamente</li>
                </ul>
              </div>
              <div class="stops-list">
                <div v-for="(stop, index) in nuevasParadas.features" :key="index" class="stop-item">
                  <span class="stop-emoji">🚌</span>
                  <span class="stop-name">Parada {{ index + 1 }}</span>
                  <span class="stop-coords">
                    {{ stop.geometry.coordinates[1].toFixed(6) }},
                    {{ stop.geometry.coordinates[0].toFixed(6) }}
                  </span>
                </div>
                <div v-if="!nuevasParadas.features.length" class="no-stops">
                  Aún no hay paradas. Haz clic en el mapa para agregarlas.
                </div>
              </div>
              <h4>Controles de Edición</h4>
              <div class="drawing-controls">
                <button @click="undoLastPoint" class="btn-secundario">↶ Deshacer Parada</button>
                <button @click="clearCurrentMap" class="btn-danger">🗑️ Limpiar Todas</button>
              </div>
              <div class="stats-box">
                <span class="stat-item">🚌 {{ nuevasParadas.features.length }} paradas</span>
              </div>
            </div>
          </div>
        </div>

        <!-- PASO 3: Revisión Final -->
        <div v-if="currentStep === 3" class="step-content">
          <h3>Revisión Final</h3>
          <p>Verifica los datos antes de guardar. Puedes volver atrás para hacer cambios.</p>

          <div class="summary-cards">
            <div class="summary-card">
              <h4>📋 Información de la Ruta</h4>
              <div class="summary-item">
                <strong>Nombre:</strong> {{ nuevaRuta.features[0].properties.name || 'Sin nombre' }}
              </div>
              <div class="summary-item"><strong>Número:</strong> {{ nuevaRuta.ruta || 'N/A' }}</div>
              <div class="summary-item">
                <strong>Descripción:</strong>
                {{ nuevaRuta.features[0].properties.desc || 'Sin descripción' }}
              </div>
              <div class="summary-item">
                <strong>Puntos del recorrido:</strong>
                {{ nuevaRuta.features[0].geometry.coordinates.length }}
              </div>
              <div class="summary-item">
                <strong>Paradas:</strong> {{ nuevasParadas.features.length }}
              </div>
            </div>

            <div class="summary-card">
              <h4>⏰ Frecuencias</h4>
              <div class="summary-item">
                <strong>Pico AM:</strong> {{ nuevaRuta.features[0].properties.peak_am }} min
              </div>
              <div class="summary-item">
                <strong>Mediodía:</strong> {{ nuevaRuta.features[0].properties.midday }} min
              </div>
              <div class="summary-item">
                <strong>Pico PM:</strong> {{ nuevaRuta.features[0].properties.peak_pm }} min
              </div>
              <div class="summary-item">
                <strong>Noche:</strong> {{ nuevaRuta.features[0].properties.night }} min
              </div>
            </div>
          </div>

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

        <!-- Navegación del Wizard -->
        <div class="wizard-navigation">
          <button v-if="currentStep > 1" @click="prevStep" class="btn-secundario">← Atrás</button>
          <div class="espaciador"></div>
          <button
            v-if="currentStep < 3"
            @click="nextStep"
            class="btn-success"
            :disabled="!isNextStepEnabled"
          >
            Siguiente →
          </button>
          <button
            v-if="currentStep === 3"
            @click="handleSave"
            class="btn-primario"
            :disabled="subiendo"
          >
            {{ subiendo ? 'Guardando...' : isEditing ? '💾 Actualizar Ruta' : '💾 Crear Ruta' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FileUpload from '@/components/admin/FileUpload.vue'
import MapEditor from '@/components/admin/MapEditor.vue'
import { mostrarAlertaExito, mostrarAlertaError } from '@/utils/alertas.js'
import {
  crearNuevaRuta,
  obtenerRutaPorId,
  obtenerParadasDeRuta,
  actualizarRuta,
} from '@/services/api.js'

const route = useRoute()
const router = useRouter()
const isEditing = computed(() => !!route.params.id)
const activeTab = ref('draw')
const currentStep = ref(1)
const mapEditor = ref(null)
const subiendo = ref(false)
const cargandoRuta = ref(false)

const nuevaRuta = ref({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: '',
        name: '',
        desc: null,
        notes: null,
        peak_am: 10,
        midday: 10,
        peak_pm: 10,
        night: 10,
      },
      geometry: {
        type: 'LineString',
        coordinates: [],
      },
    },
  ],
  ruta: '',
  image: '',
})

const nuevasParadas = ref({
  type: 'FeatureCollection',
  features: [],
  ruta: '',
})

// Cargar ruta existente si estamos en modo edición
onMounted(async () => {
  if (isEditing.value) {
    await cargarRutaExistente()
  }
})

async function cargarRutaExistente() {
  cargandoRuta.value = true
  try {
    const rutaId = route.params.id

    // Obtener datos de la ruta
    const rutaData = await obtenerRutaPorId(rutaId)

    // Cargar los datos en el formulario
    nuevaRuta.value = {
      _id: rutaData._id,
      type: rutaData.type || 'FeatureCollection',
      features: rutaData.features || [
        {
          type: 'Feature',
          properties: {
            id: rutaData.features[0]?.properties.id || '',
            name: rutaData.features[0]?.properties.name || '',
            desc: rutaData.features[0]?.properties.desc || null,
            notes: rutaData.features[0]?.properties.notes || null,
            peak_am: rutaData.features[0]?.properties.peak_am || 10,
            midday: rutaData.features[0]?.properties.midday || 10,
            peak_pm: rutaData.features[0]?.properties.peak_pm || 10,
            night: rutaData.features[0]?.properties.night || 10,
          },
          geometry: {
            type: 'LineString',
            coordinates: rutaData.features[0]?.geometry.coordinates || [],
          },
        },
      ],
      ruta: rutaData.ruta || '',
      image: rutaData.image || '',
    }

    // Intentar obtener las paradas
    try {
      const paradasData = await obtenerParadasDeRuta(rutaId)
      nuevasParadas.value = {
        type: 'FeatureCollection',
        features: paradasData.features || [],
        ruta: rutaData.ruta,
      }
    } catch (error) {
      console.warn('No se pudieron cargar las paradas:', error)
      nuevasParadas.value = {
        type: 'FeatureCollection',
        features: [],
        ruta: rutaData.ruta,
      }
    }

    mostrarAlertaExito('Ruta Cargada', 'Los datos de la ruta se han cargado correctamente.')
  } catch (error) {
    console.error('Error al cargar la ruta:', error)
    mostrarAlertaError('Error de Carga', 'No se pudo cargar la ruta. Redirigiendo...')
    setTimeout(() => router.push('/admin/rutas'), 2000)
  } finally {
    cargandoRuta.value = false
  }
}

watch(
  () => nuevaRuta.value.ruta,
  (newVal) => {
    nuevasParadas.value.ruta = newVal
  },
)

const isNextStepEnabled = computed(() => {
  if (currentStep.value === 1) {
    return (
      nuevaRuta.value.features[0].geometry.coordinates.length >= 2 &&
      nuevaRuta.value.ruta &&
      nuevaRuta.value.features[0].properties.name
    )
  }
  if (currentStep.value === 2) {
    return nuevasParadas.value.features.length > 0
  }
  return false
})

function nextStep() {
  if (isNextStepEnabled.value) {
    currentStep.value++
  } else {
    mostrarAlertaError(
      'Datos incompletos',
      'Por favor, completa los campos obligatorios para continuar.',
    )
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

function handleCoordinatesUpdate(coordinates) {
  nuevaRuta.value.features[0].geometry.coordinates = coordinates
}

function undoLastPoint() {
  if (mapEditor.value?.undoLastPoint()) {
    // El componente ya emite la actualización
  }
}

function clearCurrentMap() {
  if (mapEditor.value) {
    mapEditor.value.clearMap()
  }
}

function getFinalRutaJson() {
  const finalRuta = JSON.parse(JSON.stringify(nuevaRuta.value))
  if (!finalRuta.features[0].properties.id) {
    finalRuta.features[0].properties.id = Date.now().toString()
  }
  return finalRuta
}

function handleStopsUpdate(stops) {
  // Asegurarnos de que cada parada tenga un ID único y campos requeridos
  const stopsWithIds = stops.map((stop, index) => {
    if (!stop.properties) {
      stop.properties = {}
    }

    // Generar ID único si no existe
    if (!stop.properties.id) {
      stop.properties.id = `${Date.now()}_${index}`
    }

    // Campos requeridos con valores por defecto
    stop.properties.sequence = index
    stop.properties.travelTime = stop.properties.travelTime || 0
    stop.properties.dwellTime = stop.properties.dwellTime || 3
    stop.properties.arrivalTim = stop.properties.arrivalTim || 0
    stop.properties.departureT = stop.properties.departureT || 0
    stop.properties.passengerA = stop.properties.passengerA || 0
    stop.properties.passengerB = stop.properties.passengerB || 0

    return stop
  })

  nuevasParadas.value.features = stopsWithIds
}

function getFinalParadasJson() {
  const finalParadas = JSON.parse(JSON.stringify(nuevasParadas.value))
  const routeId = nuevaRuta.value.features[0].properties.id

  finalParadas.features.forEach((feature, index) => {
    // Asegurar que todos los campos estén presentes
    if (!feature.properties.id) {
      feature.properties.id = `${Date.now()}_${index}`
    }

    feature.properties.routeId = routeId
    feature.properties.sequence = index
    feature.properties.travelTime = feature.properties.travelTime || 0
    feature.properties.dwellTime = feature.properties.dwellTime || 3
    feature.properties.arrivalTim = feature.properties.arrivalTim || 0
    feature.properties.departureT = feature.properties.departureT || 0
    feature.properties.passengerA = feature.properties.passengerA || 0
    feature.properties.passengerB = feature.properties.passengerB || 0
  })

  return finalParadas
}

async function handleSave() {
  const rutaFinal = getFinalRutaJson()
  const paradasFinales = getFinalParadasJson()

  subiendo.value = true

  try {
    if (isEditing.value) {
      // 🔧 Usar el routeId correcto del properties.id
      const routeId = nuevaRuta.value.features[0].properties.id

      console.log('🔍 Actualizando ruta con ID:', routeId)
      console.log('📦 Paradas a guardar:', paradasFinales.features.length)

      await actualizarRuta(routeId, rutaFinal, paradasFinales)
      mostrarAlertaExito('¡Ruta Actualizada!', 'Los cambios se han guardado exitosamente.')
    } else {
      // Crear nueva ruta
      await crearNuevaRuta(rutaFinal, paradasFinales)
      mostrarAlertaExito('¡Ruta Creada!', 'La nueva ruta se ha creado exitosamente.')
    }

    router.push('/admin/rutas')
  } catch (error) {
    console.error('Error al guardar la ruta:', error)
    mostrarAlertaError(
      'Error al Guardar',
      `No se pudo ${isEditing.value ? 'actualizar' : 'crear'} la ruta: ${error.message}`,
    )
  } finally {
    subiendo.value = false
  }
}

function handleGeoJSONLoaded(geojson) {
  console.log('GeoJSON cargado:', geojson)
}
</script>

<style scoped>
.editor-container {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 4rem;
  padding-left: 1rem;
  padding-right: 1rem;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e7ef;
  flex-wrap: wrap;
  gap: 1rem;
}

.view-header h2 {
  font-size: 1.5rem;
  margin: 0;
}

@media (max-width: 768px) {
  .view-header {
    flex-direction: column;
    align-items: stretch;
  }

  .view-header h2 {
    font-size: 1.3rem;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .view-header h2 {
    font-size: 1.1rem;
  }
}

.btn-primario,
.btn-secundario,
.btn-success,
.btn-danger,
.btn-cancel {
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  user-select: none;
  -webkit-user-select: none;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .btn-primario,
  .btn-secundario,
  .btn-success,
  .btn-danger,
  .btn-cancel {
    padding: 1rem 1.5rem;
    font-size: 1rem;
    width: 100%;
    min-height: 48px;
  }
}

.btn-primario {
  background-color: #3498db;
  color: white;
}
.btn-primario:hover,
.btn-primario:active {
  background-color: #2980b9;
}
.btn-primario:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.btn-success {
  background-color: #2ecc71;
  color: white;
}
.btn-success:hover,
.btn-success:active {
  background-color: #27ae60;
}
.btn-success:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.btn-secundario {
  background-color: #ecf0f1;
  color: #34495e;
}
.btn-secundario:hover,
.btn-secundario:active {
  background-color: #dfe6e9;
}

.btn-cancel {
  background-color: #e74c3c;
  color: white;
}
.btn-cancel:hover,
.btn-cancel:active {
  background-color: #c0392b;
}

.btn-danger {
  background-color: #f1c40f;
  color: #34495e;
}
.btn-danger:hover,
.btn-danger:active {
  background-color: #f39c12;
}

.tabs {
  display: flex;
  border-bottom: 2px solid #e0e7ef;
  margin-bottom: 2rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  cursor: pointer;
  border: none;
  background: none;
  font-size: 1.1rem;
  font-weight: 600;
  color: #7f8c8d;
  position: relative;
  bottom: -2px;
  border-bottom: 3px solid transparent;
  user-select: none;
  -webkit-user-select: none;
  white-space: nowrap;
  min-height: 44px;
}

@media (max-width: 768px) {
  .tab-btn {
    flex: 1;
    justify-content: center;
    font-size: 0.95rem;
    padding: 0.8rem 1rem;
    min-height: 48px;
  }

  .tab-btn .icon {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .tab-btn {
    font-size: 0.85rem;
    padding: 0.7rem 0.5rem;
    gap: 0.3rem;
  }

  .tab-btn .icon {
    font-size: 1rem;
  }
}

.tab-btn.active {
  color: #3498db;
  border-bottom-color: #3498db;
}

.wizard-container {
  padding: 1rem 0;
}

.stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 90%;
  margin: 0 auto 3rem auto;
}

@media (max-width: 640px) {
  .stepper {
    flex-direction: column;
    width: 100%;
    gap: 1rem;
  }

  .step-connector {
    width: 3px;
    height: 40px;
    flex-grow: 0;
  }
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #95a5a6;
  text-align: center;
}

.step.active .step-label {
  color: #3498db;
  font-weight: 600;
}

.step-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #ecf0f1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #bdc3c7;
  font-weight: 600;
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .step-number {
    width: 44px;
    height: 44px;
    font-size: 1.1rem;
  }
}

.step.active .step-number {
  background-color: #3498db;
  border-color: #3498db;
  color: white;
}

.step.completed .step-number {
  background-color: #2ecc71;
  border-color: #2ecc71;
  color: white;
}

.step-connector {
  flex-grow: 1;
  height: 3px;
  background-color: #e0e7ef;
}

.step.completed ~ .step-connector,
.step.completed ~ .step.active .step-connector {
  background-color: #2ecc71;
}

.step-label {
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .step-label {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .step-label {
    font-size: 0.75rem;
  }
}

.editor-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

@media (max-width: 1024px) {
  .editor-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .editor-layout {
    gap: 1rem;
  }
}

.map-area {
  min-width: 0;
  background-color: #f4f7f9;
  border-radius: 12px;
  min-height: 350px;
}

@media (max-width: 768px) {
  .map-area {
    min-height: 400px;
    border-radius: 8px;
  }
}

.controls-area {
  background: #fdfdfd;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e0e7ef;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .controls-area {
    padding: 1rem;
    gap: 1rem;
    border-radius: 8px;
  }
}

.controls-area h3,
.controls-area h4 {
  margin: 0;
  color: #2c3e50;
  border-bottom: 1px solid #e0e7ef;
  padding-bottom: 0.75rem;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .controls-area h3,
  .controls-area h4 {
    font-size: 1rem;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #34495e;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  label {
    font-size: 0.95rem;
  }
}

input,
textarea {
  padding: 0.75rem;
  border: 1px solid #bdc3c7;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Montserrat', sans-serif;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  min-height: 44px;
}

@media (max-width: 768px) {
  input,
  textarea {
    padding: 1rem;
    font-size: 1rem;
    min-height: 48px;
  }
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

textarea {
  min-height: 80px;
  resize: vertical;
}

@media (max-width: 768px) {
  textarea {
    min-height: 100px;
  }
}

.drawing-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .drawing-controls {
    flex-direction: column;
    gap: 0.75rem;
  }

  .drawing-controls button {
    width: 100%;
  }
}

/* --- WIZARD NAVIGATION RESPONSIVE --- */
.wizard-navigation {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  border-top: 1px solid #e0e7ef;
  padding-top: 1.5rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .wizard-navigation {
    flex-direction: column-reverse;
    gap: 0.75rem;
  }
}

.wizard-navigation .espaciador {
  flex-grow: 1;
}

@media (max-width: 768px) {
  .wizard-navigation .espaciador {
    display: none;
  }
}

.review-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .review-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

.json-preview {
  background-color: #2c3e50;
  color: #ecf0f1;
  border-radius: 8px;
  padding: 1.5rem;
}

@media (max-width: 768px) {
  .json-preview {
    padding: 1rem;
  }

  .json-preview h4 {
    font-size: 0.95rem;
  }
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 0.85rem;
  max-height: 450px;
  overflow-y: auto;
  overflow-x: auto;
  background-color: #34495e;
  padding: 1rem;
  border-radius: 6px;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 768px) {
  pre {
    font-size: 0.75rem;
    max-height: 300px;
    padding: 0.75rem;
  }
}

.instruccion-paradas,
.no-stops {
  font-size: 0.9rem;
  color: #7f8c8d;
  text-align: center;
  padding: 1rem;
  background-color: #f8f9f9;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .instruccion-paradas,
  .no-stops {
    font-size: 0.85rem;
    padding: 0.85rem;
  }
}

.stops-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 250px;
  overflow-y: auto;
  padding-right: 0.5rem;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 768px) {
  .stops-list {
    max-height: 200px;
    gap: 0.5rem;
  }
}

.stop-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #fff;
  border: 1px solid #e0e7ef;
  border-radius: 8px;
  font-weight: 500;
  gap: 0.5rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .stop-item {
    padding: 0.85rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .stop-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }
}

.delete-stop-btn {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  font-size: 1.4rem;
  line-height: 1;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  margin: 2rem 0;
}

@media (max-width: 768px) {
  .loading-overlay {
    padding: 2rem;
    margin: 1rem 0;
  }
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

.info-box {
  background: #e8f4f8;
  border-left: 4px solid #3498db;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

@media (max-width: 768px) {
  .info-box {
    padding: 0.85rem;
    font-size: 0.9rem;
  }
}

.info-box p {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.info-box ul {
  margin: 0;
  padding-left: 1.5rem;
  color: #555;
}

@media (max-width: 768px) {
  .info-box ul {
    padding-left: 1.2rem;
  }
}

.info-box li {
  margin: 0.3rem 0;
}

.frequency-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin: 1rem 0;
}

@media (max-width: 480px) {
  .frequency-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}

.frequency-item {
  display: flex;
  flex-direction: column;
}

.frequency-item label {
  font-size: 0.85rem;
  margin-bottom: 0.3rem;
}

@media (max-width: 768px) {
  .frequency-item label {
    font-size: 0.9rem;
  }
}

.frequency-item input {
  padding: 0.5rem;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .frequency-item input {
    padding: 0.75rem;
    font-size: 1rem;
  }
}

.stats-box {
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 8px;
  margin-top: 1rem;
  text-align: center;
}

@media (max-width: 768px) {
  .stats-box {
    padding: 1rem;
  }
}

.stat-item {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .stat-item {
    font-size: 1rem;
  }
}

.summary-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .summary-cards {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
}

.summary-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  border: 2px solid #e0e7ef;
}

@media (max-width: 768px) {
  .summary-card {
    padding: 1rem;
    border-radius: 8px;
  }
}

.summary-card h4 {
  margin: 0 0 1rem 0;
  color: #3498db;
  font-size: 1.1rem;
  border-bottom: 2px solid #e0e7ef;
  padding-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .summary-card h4 {
    font-size: 1rem;
  }
}

.summary-item {
  padding: 0.5rem 0;
  color: #555;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .summary-item {
    font-size: 0.9rem;
    padding: 0.4rem 0;
  }
}

@media (max-width: 480px) {
  .summary-item {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
}

.summary-item strong {
  color: #2c3e50;
  display: inline-block;
  min-width: 140px;
}

@media (max-width: 480px) {
  .summary-item strong {
    min-width: auto;
  }
}

.stop-coords {
  font-size: 0.75rem;
  color: #7f8c8d;
  font-family: monospace;
}

@media (max-width: 768px) {
  .stop-coords {
    font-size: 0.7rem;
  }
}

.stop-emoji {
  font-size: 1.2rem;
  margin-right: 0.5rem;
}

@media (max-width: 768px) {
  .stop-emoji {
    font-size: 1.4rem;
  }
}

.stop-name {
  font-weight: 600;
  color: #2c3e50;
  flex: 1;
}

@media (max-width: 768px) {
  .stop-name {
    font-size: 0.95rem;
  }
}

@media (max-width: 768px) {
  button + button {
    margin-top: 0.5rem;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: #bdc3c7;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #95a5a6;
  }
}

@media (max-width: 768px) {
  input,
  textarea,
  select,
  button {
    touch-action: manipulation;
  }
}

@media (max-width: 480px) {
  .editor-container {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
}
</style>
