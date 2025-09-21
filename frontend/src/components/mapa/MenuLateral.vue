<template>
  <aside class="sidebar" :class="{ active: isOpen && !mostrarMenuRutas }">
    <div class="sidebar-header">
      <h2>BusSmart 🚌</h2>
      <button @click="$emit('close')" class="close-btn">✖</button>
    </div>
    <nav class="sidebar-menu">
      <ul>
        <li>
          <button @click="abrirMenuRutas" class="menu-btn">🗺️ Todas las rutas</button>
        </li>
        <li><a href="#">⭐ Favoritos</a></li>
        <li><a href="#">⚙️ Configuración</a></li>
        <li><a href="#">❓ Ayuda</a></li>
      </ul>
    </nav>
    <div v-if="mostrarMenuRutas" class="rutas-menu-container">
      <button @click="cerrarMenuRutas" class="close-btn rutas-close-btn">
        <span class="icon-x-circle">&#x2716;</span>
      </button>
      <MenuRutas
        :rutas="rutas"
        @mostrar-ruta="seleccionarRuta"
      />
    </div>
  </aside>
</template>

<script setup>

import { ref } from 'vue';
import { getRutas } from '../../services/api';
import MenuRutas from './MenuRutas.vue';

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

const abrirMenuRutas = async () => {
  emit('close'); // Cierra el MenuLateral primero
  setTimeout(async () => {
    mostrarMenuRutas.value = true;
    loadingRutas.value = true;
    try {
      rutas.value = await getRutas();
    } catch (e) {
      rutas.value = [];
    }
    loadingRutas.value = false;
  }, 350); // Espera 350ms para que la animación de cierre termine
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
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap');
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
.rutas-menu-container {
  position: absolute;
  top: 0;
  left: 300px;
  width: 400px;
  height: 100%;
  background: linear-gradient(135deg, #f9f9f9 0%, #e3f0ff 100%);
  z-index: 2100;
  box-shadow: 8px 0 24px rgba(44,62,80,0.12);
  padding: 2rem 2rem 1rem 2rem;
  border-top-right-radius: 24px;
  border-bottom-right-radius: 24px;
  animation: fadeInMenuRutas 0.4s cubic-bezier(.77,0,.18,1);
}
@keyframes fadeInMenuRutas {
  from { left: 300px; opacity: 0; }
  to { left: 400px; opacity: 1; }
}
.rutas-close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #eee;
  border: none;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.5rem;
  z-index: 2;
}
.icon-x-circle {
  color: #d32f2f;
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
  left: -300px;
  width: 300px;
  height: 100%;
  background: linear-gradient(135deg, #e3f0ff 0%, #f9f9f9 100%);
  z-index: 2000;
  transition: left 0.4s cubic-bezier(.77,0,.18,1);
  box-shadow: 8px 0 24px rgba(44,62,80,0.12);
  font-family: 'Montserrat', Arial, sans-serif;
}
.sidebar.active {
  left: 0;
  animation: fadeInSidebar 0.5s;
}
@keyframes fadeInSidebar {
  from { left: -300px; opacity: 0; }
  to { left: 0; opacity: 1; }
}
.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1rem 1rem 1rem;
  border-bottom: 1px solid #e0e7ef;
  background: rgba(255,255,255,0.85);
  box-shadow: 0 2px 8px rgba(44,62,80,0.04);
}
.sidebar-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #3498db;
  letter-spacing: 1px;
  margin: 0;
}
.close-btn {
  background: #fff;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(44,62,80,0.08);
  transition: background 0.2s;
}
.close-btn:hover {
  background: #f8d7da;
}
.sidebar-menu ul {
  list-style: none;
  padding: 1rem 0;
  margin: 0;
}
.sidebar-menu li {
  margin-bottom: 0.5rem;
}
.sidebar-menu li a, .menu-btn {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 1rem 1.5rem;
  color: #2c3e50;
  text-decoration: none;
  font-size: 1.1rem;
  font-family: inherit;
  border-radius: 12px;
  transition: background 0.2s, color 0.2s;
}
.sidebar-menu li a:hover, .menu-btn:hover {
  background: #e3f0ff;
  color: #3498db;
}
.rutas-menu-container {
  position: absolute;
  top: 0;
  left: 300px;
  width: 400px;
  height: 100%;
  background: linear-gradient(135deg, #f9f9f9 0%, #e3f0ff 100%);
  z-index: 2100;
  box-shadow: 8px 0 24px rgba(44,62,80,0.12);
  padding: 2rem 2rem 1rem 2rem;
  border-top-right-radius: 24px;
  border-bottom-right-radius: 24px;
  animation: fadeInMenuRutas 0.4s cubic-bezier(.77,0,.18,1);
}
@keyframes fadeInMenuRutas {
  from { left: 300px; opacity: 0; }
  to { left: 400px; opacity: 1; }
}
.rutas-close-btn {
  position: absolute;
  top: 1.2rem;
  right: 1.2rem;
  background: #fff;
  border: none;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.5rem;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(44,62,80,0.08);
  transition: background 0.2s;
}
.rutas-close-btn:hover {
  background: #f8d7da;
}
.icon-x-circle {
  color: #d32f2f;
}
.ruta-card {
  background: linear-gradient(135deg, #e3f0ff 0%, #f9f9f9 100%);
  border: none;
  border-radius: 16px;
  margin-bottom: 1.2rem;
  padding: 1.2rem 1.4rem;
  box-shadow: 0 4px 16px rgba(44,62,80,0.08);
  transition: transform 0.15s, box-shadow 0.15s;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-family: inherit;
}
.ruta-card:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 8px 24px rgba(44,62,80,0.16);
  background: linear-gradient(135deg, #e3f0ff 0%, #d0e6ff 100%);
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
  font-family: inherit;
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
body, .sidebar, .rutas-menu-container {
  font-family: 'Montserrat', Arial, sans-serif;
}
</style>