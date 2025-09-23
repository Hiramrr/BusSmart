<template>
  <aside class="sidebar" :class="{ active: isOpen, 'theme-dark': isDarkTheme }">
    <div class="sidebar-content-wrapper" :class="{ 'sub-menu-active': mostrarMenuRutas || mostrarFavoritos }">
      <div class="main-menu">
        <div class="sidebar-header">
          <h2>BusSmart 🚌</h2>
          <button @click="$emit('close')" class="close-btn"></button>
        </div>
        <nav class="sidebar-menu">
          <ul>
            <li>
              <button @click="abrirMenuRutas" class="menu-btn" href="#">🗺️ Todas las rutas</button>
            </li>
            <li><button @click="abrirFavoritos" class="menu-btn" href="#">⭐ Favoritos</button></li>
            <li><button @click="abrirForo" class="menu-btn" href="#">💬 Foro</button></li>
            
            <li><button class="menu-btn" href="#">❓ Ayuda</button></li>
          </ul>
        </nav>
      </div>
      
      <div v-if="mostrarMenuRutas" class="rutas-menu-container">
        <button @click="cerrarMenuRutas" class="close-btn rutas-close-btn">
          <span class="icon-x-circle">&lt;</span>
        </button>
        <MenuRutas
          :rutas="rutas"
          :is-dark-theme="isDarkTheme"
          @mostrar-ruta="seleccionarRuta"
        />
      </div>
      <div v-if="mostrarFavoritos" class="rutas-menu-container">
        <button @click="cerrarMenuRutas" class="close-btn rutas-close-btn">
          <span class="icon-x-circle">&lt;</span>
        </button>
        <MenuRutas
          :rutas="favoritos"
          :is-dark-theme="isDarkTheme"
          @mostrar-ruta="seleccionarRuta"
        />
      </div>
      <div v-if="mostrarForo" class="rutas-menu-container">
        <button @click="cerrarMenuRutas" class="close-btn rutas-close-btn">
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
        <div v-if="reportes.length" class="foro-reportes-lista">
          <h4>Reportes recientes</h4>
          <ul>
            <li v-for="(r, i) in reportes" :key="i" class="foro-reporte-item">
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
    </div>
  </aside>
</template>

<script setup>
const reportes = ref([]);
const mostrarForo = ref(false);
const mensajeEnviado = ref(false);
const reporte = ref({ tipo: 'alerta', descripcion: '', ubicacion: '' });
function abrirForo() {
  mostrarMenuRutas.value = false;
  mostrarFavoritos.value = false;
  mostrarForo.value = true;
  mensajeEnviado.value = false;
}
function enviarReporte() {
  reportes.value.unshift({ ...reporte.value, fecha: new Date().toLocaleString() });
  mensajeEnviado.value = true;
  reporte.value = { tipo: 'alerta', descripcion: '', ubicacion: '' };
  setTimeout(() => { mensajeEnviado.value = false; }, 2000);
}
import { ref } from 'vue';
import { getRutas } from '../../services/api';
import { useFavoritos } from '../../stores/favoritos';
import MenuRutas from './MenuRutas.vue';

function getImageUrl(imagePath) {
  return imagePath ? `http://localhost:3000${imagePath}` : '';
}

const rutas = ref([]);
const mostrarMenuRutas = ref(false);
const mostrarFavoritos = ref(false);
const loadingRutas = ref(false);

const props = defineProps({
  isOpen: Boolean,
  isDarkTheme: Boolean
});

const emit = defineEmits(['close', 'mostrar-ruta']);

const abrirMenuRutas = async () => {
  mostrarFavoritos.value = false;
  mostrarMenuRutas.value = true;
  loadingRutas.value = true;
  try {
    rutas.value = await getRutas();
  } catch (e) {
    rutas.value = [];
  }
  loadingRutas.value = false;
}

function abrirFavoritos() {
  mostrarMenuRutas.value = false;
  mostrarFavoritos.value = true;
}

function cerrarMenuRutas() {
  mostrarMenuRutas.value = false;
  mostrarFavoritos.value = false;
  mostrarForo.value = false;
}

function seleccionarRuta(id) {
  emit('mostrar-ruta', id);
}

const { favoritos } = useFavoritos();
</script>

<style scoped>
/* Estilos para la lista de reportes del foro */
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
/* Estilos para el formulario del foro */
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
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap');

.sidebar {
  position: fixed;
  top: 0;
  left: -300px;
  width: 300px;
  height: 100%;
  z-index: 2000;
  border-radius: 20px;
  transition: left 0.4s cubic-bezier(.77,0,.18,1);
  box-shadow: 8px 0 24px rgba(44,62,80,0.12);
  font-family: 'Montserrat', Arial, sans-serif;
  color: #2c3e50;
}

.sidebar.active {
  left: 0;
  color: #2c3e50; 
  backdrop-filter: blur(10px);
  background: rgba(255,255,255,0.2);
  box-shadow: 8px 0 24px rgba(44,62,80,0.25);
}

.sidebar.active.theme-dark {
  background: rgba(0,0,0,0.2);
  backdrop-filter: blur(10px);
  color: #f0f0f0;
  box-shadow: 8px 0 24px rgba(0,0,0,0.5);
}

.sidebar-content-wrapper {
  position: relative;
  width: 200%; 
  height: 100%;
  display: flex;
  transition: transform 0.4s cubic-bezier(.77,0,.18,1);
}

.sidebar-content-wrapper.sub-menu-active {
  transform: translateX(-50%); 
}

.main-menu, .rutas-menu-container {
  width: 50%;
  flex-shrink: 0;
  height: 100%;
  overflow-y: auto;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 20px;
  padding: 1.2rem 1rem 1rem 1rem;
  border-bottom: 1px solid #e0e7ef;
  background: rgba(255,255,255,0.85);
  box-shadow: 0 2px 8px rgba(44,62,80,0.04);
}

.sidebar.theme-dark .sidebar-header {
  border-bottom: 1px solid #333;
  background: rgba(42,42,42,0.85);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.sidebar-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #3498db;
  letter-spacing: 1px;
  margin: 0;
}

.sidebar.theme-dark .sidebar-header h2 {
  color: #64b5f6;
}

.close-btn {
  background: rgba(255,255,255,0.90);
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  border-radius: 50%;
  box-shadow: none;
  transition: background 0.2s;
  color: #2c3e50;
}

.sidebar.theme-dark .close-btn {
  background: #333;
  color: #f0f0f0;
}

.close-btn:hover {
  background: rgba(255,255,255,0.85);
}

.sidebar-menu ul {
  list-style: none;
  padding: 1rem 0;
  margin: 0;
}

.sidebar-menu li {
  margin-bottom: 0.5rem;
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
  transition: color 0.2s, background 0.2s;
}

.sidebar-menu li a, .menu-btn {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 1rem 1.5rem;
  color: #06090c;
  text-decoration: none;
  font-size: 1.1rem;
  font-family: inherit;
  border-radius: 12px;
  transition: background 0.2s, color 0.2s;
}

.sidebar.theme-dark .sidebar-menu li a, .sidebar.theme-dark .menu-btn {
  background: none; /* Asegura que no tenga fondo por defecto */
  color: #f0f0f0;
}

.sidebar-menu li a:hover, .menu-btn:hover {
  background: #ffffffbd;
  color: #0b0c0c;
  
}

.sidebar.theme-dark .sidebar-menu li a:hover, .sidebar.theme-dark .menu-btn:hover {
  background: #383838;
  color: #64b5f6;
}

.rutas-menu-container {
  position: relative;
  background: linear-gradient(135deg, #f9f9f9 0%, #e3f0ff 100%);
  z-index: 2100;
  box-shadow: 8px 0 24px rgba(44,62,80,0.12);
  padding: 4rem 3.5rem 1rem 3rem;
  border-top-right-radius: 24px;
  border-bottom-right-radius: 24px;
  animation: fadeInMenuRutas 0.4s cubic-bezier(.77,0,.18,1);
}

.sidebar.theme-dark .rutas-menu-container {
  background: linear-gradient(135deg, #2a2a2a 0%, #1e1e1e 100%);
}

@keyframes fadeInMenuRutas {
  from { opacity: 0; }
  to { opacity: 1; }
}

.rutas-close-btn {
  position: absolute;
  top: 1.2rem;
  left: 1rem;
  background: #eee;
  border: none;
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.5rem;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(44,62,80,0.08);
  transition: background 0.2s;
  
}

.sidebar.theme-dark .rutas-close-btn {
  background: #444;
  color: #f0f0f0;
}

.rutas-close-btn:hover {
  background: #d7f8d8;
}

.icon-x-circle {
  color: #25a72be4;
}

.sidebar.theme-dark .icon-x-circle {
  color: #80e573;
}
</style>