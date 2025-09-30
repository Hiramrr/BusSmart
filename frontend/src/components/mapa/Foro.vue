<template>
  <div>
    <div v-if="foroStore.error" class="error-message">
      {{ foroStore.error }}
      <button @click="foroStore.limpiarError()" class="error-close">×</button>
    </div>

    <form class="foro-formulario" @submit.prevent="enviarReporte">
      <h3>Reportar alerta/incidencia</h3>

      <div class="form-group">
        <label for="tipo">Tipo de reporte:</label>
  <select id="tipo" v-model="reporte.tipo" :disabled="enviando">
          <option value="alerta">Alerta de tráfico</option>
          <option value="incidencia">Incidencia</option>
        </select>
      </div>

      <div class="form-group">
        <label for="descripcion">Descripción:</label>
        <textarea
          id="descripcion"
          v-model="reporte.descripcion"
          rows="3"
          :disabled="enviando"
          placeholder="Describe la alerta o incidencia..."
        ></textarea>
      </div>

      <div class="form-group">
        <label for="ubicacion">Ubicación (opcional):</label>
        <input
          id="ubicacion"
          v-model="reporte.ubicacion"
          type="text"
          :disabled="enviando"
          placeholder="Ejemplo: Calle, colonia, referencia"
        />
      </div>

      <button type="submit" class="menu-btn" :disabled="enviando">
        <span v-if="enviando">Enviando...</span>
        <span v-else>Enviar reporte</span>
      </button>

      <div v-if="mensajeEnviado" class="mensaje-enviado">¡Reporte enviado correctamente!</div>
    </form>

    <div v-if="foroStore.reportes.length || foroStore.loading" class="foro-reportes-lista">
      <h4>Reportes recientes</h4>

      <!-- Indicador de carga -->
      <div v-if="foroStore.loading" class="loading-indicator">Cargando reportes...</div>

      <!-- Lista de reportes -->
      <ul v-else-if="foroStore.reportes.length">
        <li
          v-for="reporte in foroStore.reportes"
          :key="reporte._id || reporte.id"
          class="foro-reporte-item"
        >
          <div class="reporte-tipo">
            <span v-if="reporte.tipo === 'alerta'" class="reporte-alerta"
              >🚦 Alerta de tráfico</span
            >
            <span v-else class="reporte-incidencia">⚠️ Incidencia</span>
          </div>
          <div class="reporte-descripcion">{{ reporte.descripcion }}</div>
          <div class="reporte-ubicacion" v-if="reporte.ubicacion">📍 {{ reporte.ubicacion }}</div>
          <div class="reporte-fecha">🕒 {{ reporte.fecha }}</div>
        </li>
      </ul>

      <div v-else class="no-reportes">No hay reportes recientes</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useForoStore } from '../../stores/foro'
import { mostrarAlertaError } from '../../utils/alertas';

const foroStore = useForoStore()
const mensajeEnviado = ref(false)
const enviando = ref(false)
const reporte = ref({
  tipo: 'alerta',
  descripcion: '',
  ubicacion: '',
})

const props = defineProps({
  isDarkTheme: Boolean,
})

const emit = defineEmits(['close'])

onMounted(async () => {
  await foroStore.cargarReportesRecientes()
})

async function enviarReporte() {
  if (enviando.value) return

  // Validar antes de poner enviando en true
  if (!reporte.value.tipo || !reporte.value.descripcion) {
    mostrarAlertaError('Campos incompletos', 'Se deben llenar todos los campos obligatorios antes de enviar el reporte.');
    return;
  }

  enviando.value = true
  foroStore.limpiarError()

  try {
    await foroStore.agregarReporte(reporte.value)

    mensajeEnviado.value = true

    reporte.value = {
      tipo: 'alerta',
      descripcion: '',
      ubicacion: '',
    }

    setTimeout(() => {
      mensajeEnviado.value = false
    }, 3000)
  } catch (error) {
    console.error('Error al enviar reporte:', error)
  } finally {
    enviando.value = false
  }
}
</script>

<style scoped>
.error-message {
  background: #fee;
  color: #c53030;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #feb2b2;
}

.error-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #c53030;
  padding: 0;
  margin-left: 1rem;
}

.loading-indicator {
  text-align: center;
  padding: 1rem;
  color: #666;
  font-style: italic;
}

.sidebar.theme-dark .loading-indicator {
  color: #ccc;
}

.no-reportes {
  text-align: center;
  padding: 1rem;
  color: #888;
  font-style: italic;
}

.sidebar.theme-dark .no-reportes {
  color: #bbb;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.foro-reportes-lista {
  margin-top: 2rem;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 14px;
  padding: 1rem 1rem 0.5rem 1rem;
  box-shadow: 0 1px 4px rgba(44, 62, 80, 0.06);
}

.sidebar.theme-dark .foro-reportes-lista {
  background: rgba(42, 42, 42, 0.85);
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
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem 1.5rem 1rem 1.5rem;
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(44, 62, 80, 0.08);
}

.sidebar.theme-dark .foro-formulario {
  background: rgba(42, 42, 42, 0.95);
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
  text-align: center;
}

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
  transition:
    color 0.2s,
    background 0.2s;
}

.menu-btn:hover:not(:disabled) {
  background: #ffffffbd;
  color: #0b0c0c;
}

.sidebar.theme-dark .menu-btn {
  background: none;
  color: #f0f0f0;
}

.sidebar.theme-dark .menu-btn:hover:not(:disabled) {
  background: #383838;
  color: #64b5f6;
}

.sidebar.theme-dark .rutas-close-btn {
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a1e2b;
  border: none;
  box-shadow: 0 2px 8px rgba(44, 62, 80, 0.08);
  cursor: pointer;
  font-size: 1.5rem;
  transition: background 0.2s;
}

.close-btn {
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: none;
  box-shadow: 0 2px 8px rgba(44, 62, 80, 0.08);
  cursor: pointer;
  font-size: 1.5rem;
  transition: background 0.2s;
}

.icon-x-circle {
  color: #3498db;
}

.sidebar.theme-dark .icon-x-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #3498db;
  width: 100%;
  height: 100%;
}
</style>
