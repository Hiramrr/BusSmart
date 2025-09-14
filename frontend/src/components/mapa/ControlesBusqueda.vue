<template>
  <div class="controles-busqueda">
    <Autocomplete placeholder="Buscar Origen..." @lugarSeleccionado="guardarOrigen" />
    <Autocomplete
      placeholder="Buscar Destino por ID de Ruta..."
      @lugarSeleccionado="guardarDestino"
    />
    <button @click="buscarRuta">🚍 Buscar Ruta</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Autocomplete from './AutoCompletado.vue'

const emit = defineEmits(['rutaEncontrada', 'errorBusqueda'])

const origenSeleccionado = ref(null)
const destinoSeleccionado = ref(null)
const routeIdInput = ref('')

function guardarOrigen(lugar) {
  origenSeleccionado.value = lugar
}

function guardarDestino(lugar) {
  destinoSeleccionado.value = lugar
}

// mas o menos asi deberia de quedar la funcion final
/*async function buscarRuta() {
  if (!destinoSeleccionado.value) {
    alert('Por favor, selecciona un destino de la lista.')
    return
  }


  const routeId = destinoSeleccionado.value.id
  const apiUrl = `https://bussmart.onrender.com/api/rutas/${routeId}`

  try {
    const response = await fetch(apiUrl)
    if (!response.ok) throw new Error(`La ruta con ID "${routeId}" no fue encontrada.`)

    const geojsonData = await response.json()

    emit('rutaEncontrada', geojsonData)
  } catch (error) {
    console.error('Error en la búsqueda:', error)
    alert(error.message)
    emit('errorBusqueda', error.message)
  }
}
*/

async function buscarRuta() {
  const routeId = routeIdInput.value.trim()

  if (!routeId) {
    alert('Por el momento solo se puede buscar por ID.')
    return
  }

  const apiUrl = `https://bussmart.onrender.com/api/id/${routeId}`

  try {
    const response = await fetch(apiUrl)
    if (!response.ok) throw new Error(`La ruta con ID "${routeId}" no fue encontrada.`)

    const geojsonData = await response.json()

    emit('rutaEncontrada', geojsonData)
  } catch (error) {
    console.error('Error en la búsqueda:', error)
    alert(error.message)
    emit('errorBusqueda', error.message)
  }
}
</script>

<style scoped>
.controles-busqueda {
  display: flex;
  gap: 10px;
  padding: 10px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
  align-items: center;
  flex-wrap: wrap;
}
button {
  background: #27ae60;
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}
button:hover {
  background: #2ecc71;
}
</style>
