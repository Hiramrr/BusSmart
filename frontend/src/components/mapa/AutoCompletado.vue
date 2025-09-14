<template>
  <div class="autocomplete-container">
    <input
      type="text"
      :placeholder="placeholder"
      autocomplete="off"
      v-model="terminoBusqueda"
      @input="onInput"
    />
    <ul v-if="sugerencias.length > 0" class="suggestions-list">
      <li
        v-for="sugerencia in sugerencias"
        :key="sugerencia.id"
        @click="seleccionarSugerencia(sugerencia)"
      >
        {{ sugerencia.nombre }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { fetchAutocomplete } from '../../services/api'
defineProps({
  placeholder: { type: String, default: 'Ingresa un lugar...' },
})

const emit = defineEmits(['lugarSeleccionado'])

const terminoBusqueda = ref('')
const sugerencias = ref([])

function debounce(func, delay) {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), delay)
  }
}

const onInput = debounce(async () => {
  const query = terminoBusqueda.value.trim()
  if (!query) {
    sugerencias.value = []
    return
  }
  sugerencias.value = await fetchAutocomplete(query)
}, 300)

function seleccionarSugerencia(sugerencia) {
  terminoBusqueda.value = sugerencia.nombre
  sugerencias.value = []
  emit('lugarSeleccionado', sugerencia)
}
</script>

<style scoped>
.autocomplete-container {
  position: relative;
  flex-grow: 1;
}
input {
  width: 100%;
  padding: 8px 12px;
  box-sizing: border-box;
}
.suggestions-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #ccc;
  border-top: none;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  list-style: none;
  padding: 0;
  margin: 0;
}
.suggestions-list li {
  padding: 8px 12px;
  cursor: pointer;
}
.suggestions-list li:hover {
  background-color: #f0f0f0;
}
</style>
