<template>
    <div 
      class="drop-zone"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
      :class="{ 'drag-over': isDragging }"
      @click="triggerFileInput"
    >
      <input type="file" ref="fileInput" @change="onFileSelected" style="display: none;" accept=".json,.geojson"/>
      <div class="drop-zone-content">
        <span class="icon">☁️</span>
        <h3>Arrastra y suelta tu archivo .geojson o .json aquí</h3>
        <p>o haz clic para seleccionarlo</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { mostrarAlertaError } from '@/utils/alertas.js';
  
  const emit = defineEmits(['geojson-loaded']);
  const isDragging = ref(false);
  const fileInput = ref(null);
  
  function triggerFileInput() {
    fileInput.value.click();
  }
  
  function onDragOver() {
    isDragging.value = true;
  }
  
  function onDragLeave() {
    isDragging.value = false;
  }
  
  function onDrop(event) {
    isDragging.value = false;
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }
  
  function onFileSelected(event) {
    const files = event.target.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }
  
  function processFile(file) {
    if (!file.name.endsWith('.json') && !file.name.endsWith('.geojson')) {
      mostrarAlertaError('Formato Inválido', 'Por favor, sube un archivo con extensión .json o .geojson.');
      return;
    }
  
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const geojson = JSON.parse(e.target.result);
        emit('geojson-loaded', geojson);
      } catch (error) {
        mostrarAlertaError('Archivo Corrupto', 'El archivo no es un JSON válido.');
      }
    };
    reader.readAsText(file);
  }
  </script>
  
<style scoped>
.drop-zone {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px;
  border: 2px dashed #bdc3c7;
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
  text-align: center;
  padding: 1rem;
}
.drop-zone:hover, .drop-zone.drag-over {
  border-color: #3498db;
  background-color: #ecf0f1;
}
.drop-zone-content .icon {
  font-size: 3rem;
}
.drop-zone-content h3 {
  color: #34495e;
  margin: 1rem 0 0.5rem;
}
.drop-zone-content p {
  color: #7f8c8d;
  margin: 0;
}
</style>