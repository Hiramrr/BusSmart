<template>
  <aside class="sidebar" :class="{ active: isOpen, 'theme-dark': isDarkTheme }">
    <div class="sidebar-content-wrapper" :class="{ 'sub-menu-active': mostrarMenuRutas || mostrarFavoritos || mostrarForo }">
      <div class="main-menu">
        <div class="sidebar-header">
          <h2>BusSmart 🚌</h2>
          <button @click="handleClose" class="close-btn"></button>
        </div>
        <nav class="sidebar-menu">
          <ul>
            <li>
              <button @click="abrirMenuRutas" class="menu-btn" href="#">🗺️ Todas las rutas</button>
            </li>
            <li><button @click="abrirFavoritos" class="menu-btn" href="#">⭐ Favoritos</button></li>
            <li><button @click="abrirForo" class="menu-btn" href="#">💬 Foro</button></li>
            <li><button class="menu-btn" href="#">❓ Ayuda</button></li>
            <router-link v-if="!isAuthenticated" to="/login" class="login-btn">
              Iniciar sesion
            </router-link>
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
        <Foro :is-dark-theme="isDarkTheme" @close="cerrarMenuRutas" />
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useFavoritos } from '../../stores/favoritos';
import { getRutas } from '../../services/api';
import MenuRutas from './MenuRutas.vue';
import Foro from './Foro.vue';

const rutas = ref([]);
const mostrarMenuRutas = ref(false);
const mostrarFavoritos = ref(false);
const mostrarForo = ref(false);
const loadingRutas = ref(false);

const props = defineProps({
  isOpen: Boolean,
  isDarkTheme: Boolean
});

const emit = defineEmits(['close', 'mostrar-ruta']);

const abrirMenuRutas = async () => {
  mostrarFavoritos.value = false;
  mostrarMenuRutas.value = true;
  mostrarForo.value = false;
  loadingRutas.value = true;
  try {
    rutas.value = await getRutas();
  } catch (e) {
    rutas.value = [];
  }
  loadingRutas.value = false;
}


function abrirForo() {
  mostrarMenuRutas.value = false;
  mostrarFavoritos.value = false;
  mostrarForo.value = true;
}

function abrirFavoritos() {
  mostrarMenuRutas.value = false;
  mostrarFavoritos.value = true;
  mostrarForo.value = false;
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

// Watch for menu open to reset submenu states
watch(() => props.isOpen, (val) => {
  if (val) {
    mostrarMenuRutas.value = false;
    mostrarFavoritos.value = false;
    mostrarForo.value = false;
  }
});

function handleClose() {
  mostrarMenuRutas.value = false;
  mostrarFavoritos.value = false;
  mostrarForo.value = false;
  emit('close');
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap');
/* ...existing code... */
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

/* Botón de inicio de sesión */
.login-btn {
  position: absolute;
  bottom: 1px;
  padding: 0.5rem 1.2rem;
  background-color: #2963b3;
  border: 2px solid #2963b3;
  color: #fff;
  border-radius: 0.5rem;
  font-weight: 600;
  text-decoration: none;
  transition:
    background 0.3s,
    color 0.3s;
  box-shadow: 0 2px 8px rgba(41, 99, 179, 0.08);
  cursor: pointer;
  margin: 5rem;
  white-space: nowrap;
  

}
.login-btn:hover {
  background: #fff;
  color: #2963b3;
  border: 2px solid #2963b3;
}

/* botón de cierre del menú lateral */
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

/* botón de cierre del menú lateral modo oscuro */
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
  position: fixed;
  top: 0;
  left: 300px;      /* Justo después del sidebar */
  width: 40vw;      /* 40% del ancho de la ventana */
  height: 100vh;
  background: linear-gradient(135deg, #f9f9f9 0%, #e3f0ff 100%);
  z-index: 2100;
  box-shadow: 8px 0 24px rgba(44,62,80,0.12);
  padding: 4rem 3.5rem 1rem 3rem;
  border-top-right-radius: 24px;
  border-bottom-right-radius: 24px;
  animation: fadeInMenuRutas 0.4s cubic-bezier(.77,0,.18,1);
  overflow-y: auto;
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
  right: 1rem;   /* <-- Mueve el botón al borde derecho */
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