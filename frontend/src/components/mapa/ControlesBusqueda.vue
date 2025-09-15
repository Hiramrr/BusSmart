<template>
  <div class="controles-container">
    <div class="input-wrapper">
      <input
        type="text"
        id="origen-input"
        v-model="origenQuery"
        placeholder="📍 Ingresa tu origen..."
        @input="onOrigenInput"
        autocomplete="off"
      />
      <ul v-if="origenSuggestions.length > 0" class="suggestions-list">
        <li
          v-for="lugar in origenSuggestions"
          :key="lugar._id"
          @click="selectOrigen(lugar)"
        >
          {{ lugar.nombre }}
        </li>
      </ul>
    </div>
    <div class="input-wrapper">
      <input
        type="text"
        id="destino-input"
        v-model="destinoQuery"
        placeholder="🏁 Ingresa tu destino..."
        @input="onDestinoInput"
        autocomplete="off"
      />
      <ul v-if="destinoSuggestions.length > 0" class="suggestions-list">
        <li
          v-for="lugar in destinoSuggestions"
          :key="lugar._id"
          @click="selectDestino(lugar)"
        >
          {{ lugar.nombre }}
        </li>
      </ul>
    </div>
    <button @click="emitBuscarRuta" class="buscar-btn">🚍 Buscar Ruta</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { fetchAutocomplete } from '@/services/api.js';
import { debounce } from '@/utils/debounce.js';

// --- Emits ---
const emit = defineEmits(['buscar-ruta']);

// --- Estado Reactivo ---
const origenQuery = ref('');
const destinoQuery = ref('');
const origenSeleccionado = ref(null);
const destinoSeleccionado = ref(null);
const origenSuggestions = ref([]);
const destinoSuggestions = ref([]);

// --- Lógica de Autocompletado ---
const onOrigenInput = debounce(async () => {
  if (origenQuery.value.length < 2) {
    origenSuggestions.value = [];
    return;
  }
  origenSuggestions.value = await fetchAutocomplete(origenQuery.value);
}, 300);

const onDestinoInput = debounce(async () => {
  if (destinoQuery.value.length < 2) {
    destinoSuggestions.value = [];
    return;
  }
  destinoSuggestions.value = await fetchAutocomplete(destinoQuery.value);
}, 300);

// --- Métodos ---
function selectOrigen(lugar) {
  origenSeleccionado.value = lugar;
  origenQuery.value = lugar.nombre;
  origenSuggestions.value = [];
}

function selectDestino(lugar) {
  destinoSeleccionado.value = lugar;
  destinoQuery.value = lugar.nombre;
  destinoSuggestions.value = [];
}

function emitBuscarRuta() {
  if (!origenSeleccionado.value || !destinoSeleccionado.value) {
    alert("Por favor, selecciona un origen y un destino de la lista.");
    return;
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
  });
}
</script>

<style scoped>
.controles-container {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 700px; 
  padding: 0.75rem;
  display: flex;
  flex-direction: row;
  align-items: center; 
  gap: 0.75rem;
}

.input-wrapper {
  position: relative;
  flex-grow: 1; 
  width: 100%;
}

input {
  width: 100%;
  padding: 14px 14px 14px 40px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.2);
}

input::placeholder {
  color: #999;
}

#origen-input {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Ccircle cx='12' cy='12' r='4'%3E%3C/circle%3E%3C/svg%3E") no-repeat 12px center;
}

#destino-input {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'%3E%3C/path%3E%3Ccircle cx='12' cy='10' r='3'%3E%3C/circle%3E%3C/svg%3E") no-repeat 12px center;
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
  white-space: nowrap; /* Evita que el texto del botón se parta en dos líneas */
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.buscar-btn:hover {
  background-color: #3e5268;
}

.buscar-btn:active {
  transform: scale(0.98);
}

.suggestions-list {
  position: absolute;
  background-color: white;
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  list-style: none;
  padding: 0.5rem 0;
  margin-top: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
}

.suggestions-list li {
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-size: 0.95rem;
}

.suggestions-list li:hover {
  background-color: #f0f0f0;
}
</style>