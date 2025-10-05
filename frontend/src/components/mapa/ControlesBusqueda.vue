<template>
  <div class="controles-container">
    <div class="input-wrapper">
      <span class="input-icon input-icon-origen">📍</span>
      <input
        type="text"
        id="origen-input"
        v-model="origenQuery"
        placeholder="Ingresa tu origen..."
        @input="onOrigenInput"
        autocomplete="off"
      />
      <ul v-if="origenSuggestions.length > 0" class="suggestions-list">
        <li v-for="lugar in origenSuggestions" :key="lugar._id" @click="selectOrigen(lugar)">
          {{ lugar.nombre }}
        </li>
      </ul>
    </div>
    <div class="input-wrapper">
      <span class="input-icon input-icon-destino">🏁</span>
      <input
        type="text"
        id="destino-input"
        v-model="destinoQuery"
        placeholder="Ingresa tu destino..."
        @input="onDestinoInput"
        autocomplete="off"
      />
      <ul v-if="destinoSuggestions.length > 0" class="suggestions-list">
        <li v-for="lugar in destinoSuggestions" :key="lugar._id" @click="selectDestino(lugar)">
          {{ lugar.nombre }}
        </li>
      </ul>
    </div>
    <button @click="emitBuscarRuta" class="buscar-btn">🚍 Buscar Ruta</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { fetchAutocomplete } from '@/services/api.js'
import { debounce } from '@/utils/debounce.js'
import { mostrarAlertaError } from '@/utils/alertas.js'

const emit = defineEmits(['buscar-ruta'])

const origenQuery = ref('')
const destinoQuery = ref('')
const origenSeleccionado = ref(null)
const destinoSeleccionado = ref(null)
const origenSuggestions = ref([])
const destinoSuggestions = ref([])

const onOrigenInput = debounce(async () => {
  if (origenQuery.value.length < 2) {
    origenSuggestions.value = []
    return
  }
  origenSuggestions.value = await fetchAutocomplete(origenQuery.value)
}, 300)

const onDestinoInput = debounce(async () => {
  if (destinoQuery.value.length < 2) {
    destinoSuggestions.value = []
    return
  }
  destinoSuggestions.value = await fetchAutocomplete(destinoQuery.value)
}, 300)

function selectOrigen(lugar) {
  origenSeleccionado.value = lugar
  origenQuery.value = lugar.nombre
  origenSuggestions.value = []
}

function selectDestino(lugar) {
  destinoSeleccionado.value = lugar
  destinoQuery.value = lugar.nombre
  destinoSuggestions.value = []
}

function emitBuscarRuta() {
  if (!origenSeleccionado.value || !destinoSeleccionado.value) {
    mostrarAlertaError('Error', 'Debes seleccionar tanto un origen como un destino válido.')
    return
  }

  emit('buscar-ruta', {
    origen: {
      lat: origenSeleccionado.value.location.coordinates[1],
      lng: origenSeleccionado.value.location.coordinates[0],
    },
    destino: {
      lat: destinoSeleccionado.value.location.coordinates[1],
      lng: destinoSeleccionado.value.location.coordinates[0],
    },
  })
}
</script>

<style scoped>
.controles-container {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1500;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
  width: 90%;
  max-width: 700px;
  padding: 0.75rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
  transition: background-color 0.3s ease;
  background-color: var(--color-bg-light);
}

.map-view-container.theme-dark .controles-container {
  background-color: var(--color-surface-dark);
}

.input-wrapper {
  position: relative;
  flex-grow: 1;
  width: 100%;
  min-width: 0;
}

/* SOLUCIÓN: Ícono como elemento separado con pointer-events: none */
.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  pointer-events: none; /* CRÍTICO: El ícono no debe bloquear clicks */
  z-index: 1;
  user-select: none;
}

input {
  width: 100%;
  padding: 14px 14px 14px 40px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  background-color: #fff;
  color: #2c3e50;
  position: relative;
  z-index: 0;
}

.map-view-container.theme-dark input {
  background-color: #383838;
  color: #f0f0f0;
  border-color: #4a4a4a;
}

input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.2);
}

input::placeholder {
  color: #999;
}

.buscar-btn {
  padding: 14px 20px;
  border: none;
  background-color: #2c3e50;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
  white-space: nowrap;
  transition:
    background-color 0.2s ease,
    transform 0.1s ease;
  flex-shrink: 0;
}

.buscar-btn:hover {
  background-color: #3e5268;
}

.buscar-btn:active {
  transform: scale(0.98);
}

.suggestions-list {
  position: absolute;
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  list-style: none;
  padding: 0.5rem 0;
  margin-top: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
  transition: background-color 0.3s ease;
  background-color: #fff;
}

.map-view-container.theme-dark .suggestions-list {
  background-color: #2a2a2a;
  border-color: #4a4a4a;
}

.suggestions-list li {
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-size: 0.95rem;
  color: #2c3e50;
}

.map-view-container.theme-dark .suggestions-list li {
  color: #f0f0f0;
}

.suggestions-list li:hover {
  background-color: #f0f0f0;
}

.map-view-container.theme-dark .suggestions-list li:hover {
  background-color: #383838;
}

/* Estilos móvil */
@media (max-width: 768px) {
  .controles-container {
    top: 75px;
    width: calc(100% - 32px);
    left: 16px;
    transform: none;
    padding: 0.6rem;
    gap: 0.6rem;
    flex-direction: column;
  }

  .input-wrapper {
    width: 100%;
  }

  input {
    font-size: 16px; /* Evita zoom en iOS */
    padding: 13px 13px 13px 38px;
    min-height: 48px;
  }

  .input-icon {
    font-size: 1.1rem;
  }

  .buscar-btn {
    width: 100%;
    padding: 13px 18px;
    font-size: 1rem;
    min-height: 48px;
  }

  .suggestions-list {
    max-height: 180px;
  }

  .suggestions-list li {
    padding: 0.9rem 1rem;
    font-size: 1rem;
    min-height: 48px;
    display: flex;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .controles-container {
    top: 70px;
    width: calc(100% - 24px);
    left: 12px;
    padding: 0.5rem;
  }

  input {
    padding: 12px 12px 12px 36px;
    min-height: 46px;
  }

  .buscar-btn {
    padding: 12px 16px;
    min-height: 46px;
  }
}
</style>
