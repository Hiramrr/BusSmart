<template>
  <aside class="sidebar" :class="{ active: isOpen, 'theme-dark': isDarkTheme }">
    <div class="sidebar-content-wrapper" :class="{ 'sub-menu-active': mostrarMenuRutas || mostrarFavoritos }">
      <div class="main-menu">
        <div class="sidebar-header">
          <h2>BusSmart 🚌</h2>
          <button @click="$emit('close')" class="close-btn">✖</button>
        </div>
        <nav class="sidebar-menu">
          <ul>
            <li>
              <button @click="abrirMenuRutas" class="menu-btn">🗺️ Todas las rutas</button>
            </li>
            <li>
              <button @click="abrirFavoritos" class="menu-btn">⭐ Favoritos</button>
            </li>
            <li><a href="#">⚙️ Configuración</a></li>
            <li><a href="#">❓ Ayuda</a></li>
          </ul>
        </nav>
      </div>
      <div v-if="mostrarMenuRutas" class="rutas-menu-container">
        <button @click="cerrarMenuRutas" class="close-btn rutas-close-btn">
          <span class="icon-x-circle">&#x2716;</span>
        </button>
        <MenuRutas
          :rutas="rutas"
          :is-dark-theme="isDarkTheme"
          @mostrar-ruta="seleccionarRuta"
        />
      </div>
      <div v-if="mostrarFavoritos" class="rutas-menu-container">
        <button @click="cerrarMenuRutas" class="close-btn rutas-close-btn">
          <span class="icon-x-circle">&#x2716;</span>
        </button>
        <MenuRutas
          :rutas="favoritos"
          :is-dark-theme="isDarkTheme"
          @mostrar-ruta="seleccionarRuta"
        />
      </div>
    </div>
  </aside>
</template>

<script setup>
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
}

function seleccionarRuta(id) {
  emit('mostrar-ruta', id);
}

const { favoritos } = useFavoritos();
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap');

.sidebar {
  position: fixed;
  top: 0;
  left: -300px;
  width: 300px;
  height: 100%;
  z-index: 2000;
  transition: left 0.4s cubic-bezier(.77,0,.18,1);
  box-shadow: 8px 0 24px rgba(44,62,80,0.12);
  font-family: 'Montserrat', Arial, sans-serif;
  
  background: linear-gradient(135deg, #e3f0ff 0%, #f9f9f9 100%);
  color: #2c3e50;
}

.sidebar.active {
  left: 0;
}

.sidebar.active.theme-dark {
  background: linear-gradient(135deg, #2a2a2a 0%, #1e1e1e 100%);
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
  background: #fff;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(44,62,80,0.08);
  transition: background 0.2s;
  color: #2c3e50;
}

.sidebar.theme-dark .close-btn {
  background: #333;
  color: #f0f0f0;
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

.sidebar.theme-dark .sidebar-menu li a, .sidebar.theme-dark .menu-btn {
  background: none; /* Asegura que no tenga fondo por defecto */
  color: #f0f0f0;
}

.sidebar-menu li a:hover, .menu-btn:hover {
  background: #e3f0ff;
  color: #3498db;
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
  padding: 2rem 2rem 1rem 2rem;
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
  box-shadow: 0 2px 8px rgba(44,62,80,0.08);
  transition: background 0.2s;
}

.sidebar.theme-dark .rutas-close-btn {
  background: #444;
  color: #f0f0f0;
}

.rutas-close-btn:hover {
  background: #f8d7da;
}

.icon-x-circle {
  color: #d32f2f;
}

.sidebar.theme-dark .icon-x-circle {
  color: #e57373;
}
</style>