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
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;

  transition: background-color 0.3s ease, color 0.3s ease;
  background-color: #fff;
}



.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
  
  background-color: #f7f7f7;
}

.map-view-container.theme-dark .panel-header {
  background-color: #333;
  border-bottom: 1px solid #4a4a4a;
}

.panel-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #2c3e50;
}

.map-view-container.theme-dark .panel-header h3 {
  color: #f0f0f0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #2c3e50;
}

.map-view-container.theme-dark .close-btn {
  color: #f0f0f0;
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
  color: #2c3e50;
}

.map-view-container.theme-dark li {
  color: #f0f0f0;
  border-bottom: 1px solid #4a4a4a;
}

li:last-child {
  border-bottom: none;
}

li:hover {
  background-color: #f0f7ff;
}

.map-view-container.theme-dark li:hover {
  background-color: #334455;
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

.map-view-container.theme-dark .descripcion-ruta {
  color: #a0a0a0;
}

.distancia-ruta span {
  font-weight: 500;
  background-color: #eef5ff;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #2c3e50;
}

.map-view-container.theme-dark .distancia-ruta span {
  background-color: #334455;
  color: #a0a0a0;
}
</style>