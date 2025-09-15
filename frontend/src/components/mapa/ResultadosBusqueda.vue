<template>
  <div v-if="sugerencias.length > 0" class="resultados-panel">
    <div class="panel-header">
      <h3>Rutas Sugeridas</h3>
      <button @click="$emit('close')" class="close-btn">✖</button>
    </div>
    <ul>
      <li v-for="ruta in sugerencias" :key="ruta.routeId" @click="seleccionarRuta(ruta)">
        <div class="info-ruta">
          <span class="nombre-ruta">{{ ruta.nombreRuta }}</span>
          <span class="descripcion-ruta">{{ ruta.descripcionRuta }}</span>
        </div>
        <div class="distancia-ruta">
          <span>🚶‍♂️ {{ Math.round(ruta.distanciaTotalCaminando) }} mts</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  sugerencias: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['ruta-seleccionada', 'close']);

function seleccionarRuta(ruta) {
  emit('ruta-seleccionada', ruta);
}
</script>

<style scoped>
.resultados-panel {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 450px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: #f7f7f7;
  border-bottom: 1px solid #eee;
}
.panel-header h3 {
  margin: 0;
  font-size: 1.1rem;
}
.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 250px;
  overflow-y: auto;
}
li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}
li:last-child {
  border-bottom: none;
}
li:hover {
  background-color: #f0f7ff;
}
.info-ruta {
  display: flex;
  flex-direction: column;
}
.nombre-ruta {
  font-weight: bold;
}
.descripcion-ruta {
  font-size: 0.85rem;
  color: #666;
}
.distancia-ruta span {
  font-weight: 500;
  background-color: #eef5ff;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.9rem;
}
</style>