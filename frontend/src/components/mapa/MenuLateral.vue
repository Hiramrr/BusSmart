<template>
  <aside class="sidebar" :class="{ active: isOpen }">
    <div class="sidebar-header">
      <h2>BusSmart 🚌</h2>
      <button @click="$emit('close')" class="close-btn">✖</button>
    </div>
    <nav class="sidebar-menu">
      <ul>
        <li>
          <button @click="mostrarRutas" class="menu-btn">🗺️ Todas las rutas</button>
        </li>
        <li><a href="#">⭐ Favoritos</a></li>
        <li><a href="#">⚙️ Configuración</a></li>
        <li><a href="#">❓ Ayuda</a></li>
      </ul>
    </nav>
    <div v-if="mostrarMenuRutas" class="rutas-menu">
      <h3>Rutas disponibles</h3>
      <div v-if="loadingRutas">Cargando rutas...</div>
      <div v-else>
        <div v-if="rutas.length === 0">No hay rutas disponibles.</div>
        <div v-else>
          <div
            v-for="ruta in rutas"
            :key="ruta.id" class="ruta-card"
            @click="seleccionarRuta(ruta.id)" style="cursor:pointer;"
          >
            <div class="ruta-card-header">
              <span class="ruta-icon">🚌</span>
              <h4 class="ruta-nombre">{{ ruta.name || 'Ruta sin nombre' }}</h4>
            </div>
            <div v-if="ruta.image" class="ruta-imagen" style="margin-bottom:8px;">
              <img :src="getImageUrl(ruta.image)" :alt="'Imagen de ' + (ruta.name || ruta.id)" style="width:100%;max-height:120px;object-fit:contain;border-radius:16px;margin-top:8px;display:block;margin-left:auto;margin-right:auto;" />
            </div>
            <div class="ruta-card-body">
              <div class="ruta-id"><strong>ID:</strong> {{ ruta.id || 'N/A' }}</div>
              <div class="ruta-desc">{{ ruta.desc || 'Sin descripción' }}</div>
            </div>
          </div>
          </div>
      </div>
      <button @click="cerrarMenuRutas" class="close-btn">Cerrar</button>
    </div>
  </aside>
</template>

<script setup>

import { ref } from 'vue';
import { getRutas } from '../../services/api';

function getImageUrl(imagePath) {
  return imagePath ? `http://localhost:3000${imagePath}` : '';
}

const rutas = ref([]);
const mostrarMenuRutas = ref(false);
const loadingRutas = ref(false);

const props = defineProps({
  isOpen: Boolean,
});
// ✅ CAMBIO: Se define el emit correctamente
const emit = defineEmits(['close', 'mostrar-ruta']);

async function mostrarRutas() {
  mostrarMenuRutas.value = true;
  loadingRutas.value = true;
  try {
    rutas.value = await getRutas();
  } catch (e) {
    rutas.value = [];
  }
  loadingRutas.value = false;
}

function cerrarMenuRutas() {
  mostrarMenuRutas.value = false;
}

// ✅ CAMBIO: El parámetro ahora se llama 'id' para mayor claridad
function seleccionarRuta(id) {
  emit('mostrar-ruta', id);
}
</script>

<style scoped>
/* Tus estilos se mantienen exactamente iguales */
.menu-btn {
  background: none;
  border: none;
  font-size: 1.1rem;
  color: #2c3e50;
  padding: 1rem 1.5rem;
  text-align: left;
  width: 100%;
  cursor: pointer;
}
.menu-btn:hover {
  background-color: #f0f0f0;
}
.rutas-menu {
  background: #f9f9f9;
  border-left: 2px solid #eee;
  padding: 1rem;
  position: absolute;
  top: 0;
  left: 300px;
  width: 320px;
  height: 100%;
  overflow-y: auto;
  z-index: 2100;
  box-shadow: 4px 0 10px rgba(0,0,0,0.08);
}
.ruta-card {
  background: linear-gradient(135deg, #e3f0ff 0%, #f9f9f9 100%);
  border: none;
  border-radius: 16px;
  margin-bottom: 1.2rem;
  padding: 1.2rem 1.4rem;
  box-shadow: 0 4px 16px rgba(44,62,80,0.08);
  transition: transform 0.15s;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.ruta-card:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 24px rgba(44,62,80,0.12);
}
.ruta-card-header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 0.3rem;
}
.ruta-icon {
  font-size: 2rem;
  color: #3498db;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(52,152,219,0.08);
  padding: 0.2rem 0.4rem;
}
.ruta-nombre {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}
.ruta-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.ruta-id {
  font-size: 0.95rem;
  color: #2980b9;
}
.ruta-desc {
  font-size: 1rem;
  color: #555;
  margin-top: 0.2rem;
}
.sidebar {
  position: fixed;
  top: 0;
  left: -300px; /* Inicia oculto */
  width: 300px;
  height: 100%;
  background-color: #fff;
  z-index: 2000;
  transition: left 0.3s ease-in-out;
  box-shadow: 4px 0 10px rgba(0,0,0,0.1);
}
.sidebar.active {
  left: 0; /* Se muestra */
}
.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}
.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
.sidebar-menu ul {
  list-style: none;
  padding: 1rem 0;
}
.sidebar-menu li a {
  display: block;
  padding: 1rem 1.5rem;
  color: #2c3e50;
  text-decoration: none;
  font-size: 1.1rem;
}
.sidebar-menu li a:hover {
  background-color: #f0f0f0;
}
</style>