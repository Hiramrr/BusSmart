<template>
  <div>
    <button @click="$emit('close')" class="close-btn rutas-close-btn">
      <span class="icon-x-circle">&lt;</span>
    </button>
    <form class="foro-formulario" @submit.prevent="enviarReporte">
      <h3>Reportar alerta/incidencia</h3>
      <div class="form-group">
        <label for="tipo">Tipo de reporte:</label>
        <select id="tipo" v-model="reporte.tipo" required>
          <option value="alerta">Alerta de tráfico</option>
          <option value="incidencia">Incidencia</option>
        </select>
      </div>
      <div class="form-group">
        <label for="descripcion">Descripción:</label>
        <textarea id="descripcion" v-model="reporte.descripcion" rows="3" required placeholder="Describe la alerta o incidencia..."></textarea>
      </div>
      <div class="form-group">
        <label for="ubicacion">Ubicación (opcional):</label>
        <input id="ubicacion" v-model="reporte.ubicacion" type="text" placeholder="Ejemplo: Calle, colonia, referencia" />
      </div>
      <button type="submit" class="menu-btn">Enviar reporte</button>
      <div v-if="mensajeEnviado" class="mensaje-enviado">¡Reporte enviado!</div>
    </form>
    <div v-if="foroStore.reportes.length" class="foro-reportes-lista">
      <h4>Reportes recientes</h4>
      <ul>
        <li v-for="(r, i) in foroStore.reportes" :key="i" class="foro-reporte-item">
          <div class="reporte-tipo">
            <span v-if="r.tipo === 'alerta'" class="reporte-alerta">🚦 Alerta de tráfico</span>
            <span v-else class="reporte-incidencia">⚠️ Incidencia</span>
          </div>
          <div class="reporte-descripcion">{{ r.descripcion }}</div>
          <div class="reporte-ubicacion" v-if="r.ubicacion">📍 {{ r.ubicacion }}</div>
          <div class="reporte-fecha">🕒 {{ r.fecha }}</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useForoStore } from '../../stores/foro';

const foroStore = useForoStore();
const reportes = ref(foroStore.reportes);
const mensajeEnviado = ref(false);
const reporte = ref({ tipo: 'alerta', descripcion: '', ubicacion: '' });
const props = defineProps({ isDarkTheme: Boolean });
const emit = defineEmits(['close']);

function enviarReporte() {
  foroStore.agregarReporte(reporte.value);
  mensajeEnviado.value = true;
  reporte.value = { tipo: 'alerta', descripcion: '', ubicacion: '' };
  setTimeout(() => { mensajeEnviado.value = false; }, 2000);
}
</script>

<style scoped>
.foro-reportes-lista {
  margin-top: 2rem;
  background: rgba(255,255,255,0.85);
  border-radius: 14px;
  padding: 1rem 1rem 0.5rem 1rem;
  box-shadow: 0 1px 4px rgba(44,62,80,0.06);
}
.sidebar.theme-dark .foro-reportes-lista {
  background: rgba(42,42,42,0.85);
  color: #f0f0f0;
}
.foro-reportes-lista h4 {
  margin: 0 0 0.7rem 0;
  font-size: 1.05rem;
  color: #3498db;
}
.sidebar.theme-dark .foro-reportes-lista h4 {
  color: #64b5f6;
}
.foro-reporte-item {
  border-bottom: 1px solid #e0e7ef;
  padding: 0.7rem 0;
  margin-bottom: 0.5rem;
  font-size: 0.98rem;
}
.sidebar.theme-dark .foro-reporte-item {
  border-bottom: 1px solid #444;
}
.foro-reporte-item:last-child {
  border-bottom: none;
}
.reporte-tipo {
  font-weight: 600;
  margin-bottom: 0.2rem;
}
.reporte-alerta {
  color: #e67e22;
}
.reporte-incidencia {
  color: #c0392b;
}
.reporte-descripcion {
  margin-bottom: 0.2rem;
}
.reporte-ubicacion {
  font-size: 0.95rem;
  color: #2980b9;
}
.sidebar.theme-dark .reporte-ubicacion {
  color: #80bfff;
}
.reporte-fecha {
  font-size: 0.85rem;
  color: #888;
}
.sidebar.theme-dark .reporte-fecha {
  color: #bbb;
}
.foro-formulario {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  background: rgba(255,255,255,0.95);
  padding: 2rem 1.5rem 1rem 1.5rem;
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(44,62,80,0.08);
}
.sidebar.theme-dark .foro-formulario {
  background: rgba(42,42,42,0.95);
  color: #f0f0f0;
}
.foro-formulario h3 {
  margin-top: 0;
  font-size: 1.2rem;
  color: #3498db;
}
.sidebar.theme-dark .foro-formulario h3 {
  color: #64b5f6;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.foro-formulario label {
  font-weight: 600;
  font-size: 1rem;
}
.foro-formulario input,
.foro-formulario select,
.foro-formulario textarea {
  border-radius: 8px;
  border: 1px solid #d0d7e2;
  padding: 0.5rem;
  font-size: 1rem;
  font-family: inherit;
}
.sidebar.theme-dark .foro-formulario input,
.sidebar.theme-dark .foro-formulario select,
.sidebar.theme-dark .foro-formulario textarea {
  background: #222;
  color: #f0f0f0;
  border: 1px solid #444;
}
.foro-formulario .mensaje-enviado {
  color: #25a72b;
  font-weight: bold;
  margin-top: 0.5rem;
}
/* Hereda los estilos de los botones principales del menú lateral */
.menu-btn {
  background: none;
  border: none;
  box-shadow: none !important;
  padding: 10px;
  margin: 0px;
  border-radius: 0;
  color: inherit;
  font: inherit;
  text-align: left;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}

.menu-btn:hover {
  background: #ffffffbd;
  color: #0b0c0c;
}

.sidebar.theme-dark .menu-btn {
  background: none;
  color: #f0f0f0;
}

.sidebar.theme-dark .menu-btn:hover {
  background: #383838;
  color: #64b5f6;
}
</style>
