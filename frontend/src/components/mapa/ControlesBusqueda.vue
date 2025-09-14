<template>
  <div class="controles-container">
    <div class="input-wrapper">
      <input 
        type="text" 
        v-model="origenQuery"
        placeholder="📍 Ingresa tu origen..."
        @input="onOrigenInput"
      />
      <ul v-if="origenSuggestions.length > 0" class="suggestions-list">
        <li 
          v-for="lugar in origenSuggestions" 
          :key="lugar.id" 
          @click="selectOrigen(lugar)">
          {{ lugar.nombre }}
        </li>
      </ul>
    </div>
    <div class="input-wrapper">
      <input 
        type="text" 
        v-model="destinoQuery"
        placeholder="🏁 Ingresa tu destino..."
        @input="onDestinoInput"
      />
      <ul v-if="destinoSuggestions.length > 0" class="suggestions-list">
        <li v-for="lugar in destinoSuggestions" :key="lugar.id" @click="selectDestino(lugar)">
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
// Declaramos el evento que este componente puede emitir hacia su padre.
const emit = defineEmits(['buscar-ruta']);

// --- Estado Reactivo ---
const origenQuery = ref('');
const destinoQuery = ref('');
const origenSeleccionado = ref(null);
const destinoSeleccionado = ref(null);
const origenSuggestions = ref([]);
const destinoSuggestions = ref([]);

// --- Lógica de Autocompletado (con debounce) ---
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
  // Por ahora, usamos el mismo autocomplete. ¡Esto es escalable!
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
  destinoQuery.value = lugar.nombre; // En tu UI.js usabas el ID aquí, lo adaptamos
  destinoSuggestions.value = [];
}

function emitBuscarRuta() {
  if (!destinoQuery.value) {
    alert("Por favor, selecciona un destino.");
    return;
  }
  // Emitimos el evento 'buscar-ruta' con el ID (o el objeto completo si lo prefieres).
  // Se usa el valor del input directamente para mantener la lógica de tu `buscarRutaPrueba`
  emit('buscar-ruta', destinoQuery.value);
}

</script>

<style scoped>
.controles-container {
  position: absolute;
  top: 15px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  gap: 10px;
  padding: 10px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  width: 80%;
  max-width: 700px;
}
.input-wrapper {
  position: relative;
  flex-grow: 1;
}
input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
}
.buscar-btn {
  padding: 10px 15px;
  border: none;
  background-color: #2c3e50;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}
.suggestions-list {
  position: absolute;
  background-color: white;
  width: 100%;
  border: 1px solid #ddd;
  border-top: none;
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
}
.suggestions-list li {
  padding: 10px;
  cursor: pointer;
}
.suggestions-list li:hover {
  background-color: #f0f0f0;
}
</style>