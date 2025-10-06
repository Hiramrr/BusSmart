<template>
    <aside 
    class="sidebar" 
    :class="{ 
        active: isOpen, 
        'sub-menu-active': mostrarMenuRutas || mostrarFavoritos || mostrarForo 
    }"
    >
   <div class="sidebar-content-wrapper">
      <div class="main-menu">
        <div class="sidebar-header">
          <img src="@/assets/Imagenes/LogoBusSmart.png" alt="Logo de BusSmart" class="sidebar-logo" />
          <button
            @click="handleClose"
            class="close-btn"
            :class="{ 'submenu-active-btn': mostrarMenuRutas || mostrarFavoritos || mostrarForo }"
          ></button>
        </div>

        <nav class="sidebar-menu">
          <ul>
            <li>
              <button @click="abrirMenuRutas" class="menu-btn">🗺️ Todas las rutas</button>
            </li>
            <li><button @click="abrirFavoritos" class="menu-btn">⭐ Favoritos</button></li>
            <li><button @click="abrirForo" class="menu-btn">💬 Foro</button></li>
            <li><button class="menu-btn">❓ Ayuda</button></li>

            <!-- Botón Admin solo para administradores -->
            <li v-if="isAdmin">
              <router-link to="/admin" class="menu-btn admin-menu-btn">
                🛠️ Panel Admin
              </router-link>
            </li>
          </ul>
        </nav>

        <!-- Perfil de usuario o botón de login -->
        <div class="user-section">
          <!-- Si no está autenticado: botón de login -->
          <router-link v-if="!isAuthenticated" to="/login" class="login-btn">
            Iniciar sesión
          </router-link>

          <!-- Si está autenticado: perfil de usuario -->
          <div v-else class="user-profile-card">
            <div class="user-profile-header" @click="toggleUserMenu">
              <img
                :src="user?.profile?.picture || 'https://via.placeholder.com/48'"
                :alt="user?.profile?.name || 'Usuario'"
                class="user-avatar"
              />
              <div class="user-info">
                <span class="user-name">{{ user?.profile?.name || 'Usuario' }}</span>
                <span class="user-role" v-if="isAdmin">👑 Administrador</span>
                <span class="user-role" v-else>👤 Usuario</span>
              </div>
              <svg
                class="chevron-icon"
                :class="{ rotated: showUserMenu }"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>

            <!-- Menú desplegable -->
            <transition name="slide-fade">
              <div v-if="showUserMenu" class="user-dropdown">
                <router-link to="/perfil" class="dropdown-item" @click="handleClose">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Mi Perfil
                </router-link>
                <button @click="handleLogout" class="dropdown-item logout-item">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Cerrar Sesión
                </button>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <div v-if="mostrarMenuRutas || mostrarFavoritos" class="rutas-menu-container">
        <button
          @click="cerrarMenuRutas"
          class="close-btn rutas-close-btn"
          aria-label="Volver al menú principal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <MenuRutas
          :rutas="mostrarFavoritos ? rutasFavoritasCargadas : rutas"
          @mostrar-ruta="seleccionarRuta"
        />
      </div>

      <div v-if="mostrarForo" class="rutas-menu-container">
        <button
          @click="cerrarMenuRutas"
          class="close-btn rutas-close-btn"
          aria-label="Volver al menú principal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <Foro @close="cerrarMenuRutas" />
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useAuth } from '@/componibles/useAuth.js'
import { getRutas, obtenerFavoritos } from '@/services/api'
import MenuRutas from './MenuRutas.vue'
import Foro from './Foro.vue'

const { user, isAuthenticated, isAdmin, logout } = useAuth()

const rutas = ref([])
const mostrarMenuRutas = ref(false)
const mostrarFavoritos = ref(false)
const mostrarForo = ref(false)
const loadingRutas = ref(false)
const showUserMenu = ref(false)
const rutasFavoritasCargadas = ref([])

const props = defineProps({
  isOpen: Boolean,
})

const emit = defineEmits(['close', 'mostrar-ruta', 'submenu-toggle'])

const abrirMenuRutas = async () => {
  mostrarFavoritos.value = false
  mostrarMenuRutas.value = true
  mostrarForo.value = false
  loadingRutas.value = true
  try {
    rutas.value = await getRutas()
  } catch (e) {
    rutas.value = []
  }
  loadingRutas.value = false
}

function abrirForo() {
  mostrarMenuRutas.value = false
  mostrarFavoritos.value = false
  mostrarForo.value = true
}

const cargarFavoritosCompletos = async () => {
  if (!isAuthenticated.value) {
    rutasFavoritasCargadas.value = []
    return
  }

  try {
    const respuesta = await obtenerFavoritos()
    const favoritosIds = respuesta.rutasFavoritas || []

    const todasLasRutas = await getRutas()

    rutasFavoritasCargadas.value = todasLasRutas.filter((ruta) => favoritosIds.includes(ruta.id))

    console.log('✅ Favoritos cargados en menú lateral:', rutasFavoritasCargadas.value.length)
  } catch (error) {
    console.error('❌ Error al cargar favoritos completos:', error)
    rutasFavoritasCargadas.value = []
  }
}

async function abrirFavoritos() {
  mostrarMenuRutas.value = false
  mostrarFavoritos.value = true
  mostrarForo.value = false
  await cargarFavoritosCompletos()
}

function cerrarMenuRutas() {
  mostrarMenuRutas.value = false
  mostrarFavoritos.value = false
  mostrarForo.value = false
}

function seleccionarRuta(id) {
  emit('mostrar-ruta', id)
}

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

function handleLogout() {
  showUserMenu.value = false
  logout()
}

watch(
  () => props.isOpen,
  (val) => {
    if (!val) {
      cerrarMenuRutas()
      showUserMenu.value = false
    }
  },
)

watch([mostrarMenuRutas, mostrarFavoritos, mostrarForo], ([rutas, favs, foro]) => {
  const anyActive = rutas || favs || foro
  emit('submenu-toggle', anyActive)
})

function handleClose() {
  cerrarMenuRutas()
  showUserMenu.value = false
  emit('close')
}

const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    if (mostrarMenuRutas.value || mostrarFavoritos.value || mostrarForo.value) {
      cerrarMenuRutas()
    } else if (props.isOpen) {
      handleClose()
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap');

.sidebar {
  position: fixed;
  top: 0;
  left: -300px;
  /* Ancho inicial del menú principal */
  width: 300px;
  height: 100%;
  z-index: 2000;
  border-radius: 20px;
  box-shadow: 8px 0 24px rgba(44, 62, 80, 0.12);
  font-family: 'Montserrat', Arial, sans-serif;
  color: #2c3e50;
  pointer-events: none;
  /* El overflow es crucial para mantener los bordes redondeados durante la animación */
  overflow: hidden;
  /* Transicionamos el ancho (para expandir) y la posición (para mostrar/ocultar) */
  transition: width 0.4s cubic-bezier(0.77, 0, 0.18, 1),
              left 0.4s cubic-bezier(0.77, 0, 0.18, 1);
}

.sidebar.active {
  left: 0;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.2);
  pointer-events: auto;
}

/* Cuando el submenú está activo, el sidebar se expande al nuevo tamaño */
.sidebar.sub-menu-active {
  width: 450px;
}

.sidebar-content-wrapper {
  display: flex;
  height: 100%;
  /* Ancho total = 300px (menú) + 450px (submenú) = 750px */
  width: 750px;
  /* Esta es la animación que desliza los paneles */
  transition: transform 0.4s cubic-bezier(0.77, 0, 0.18, 1);
  transform: translateX(0);
}

/* Al activarse, el wrapper se desliza para ocultar físicamente el menú principal */
.sidebar.sub-menu-active .sidebar-content-wrapper {
  transform: translateX(-300px);
}

.main-menu {
  width: 300px;
  flex-shrink: 0; /* Evita que el panel se encoja */
  height: 100%;
  overflow-y: auto;
  padding: 0 0.75rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.rutas-menu-container {
  width: 450px;
  flex-shrink: 0; /* Evita que el panel se encoja */
  height: 100%;
  overflow-y: auto;
  background: linear-gradient(135deg, #f9f9f9 0%, #e3f0ff 100%);
  padding: 4.5rem 1.5rem 1.5rem;
  box-sizing: border-box;
  position: relative;
}

/* --- ESTILOS GENERALES Y DE USUARIO --- */

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1rem;
  border-bottom: 1px solid #e0e7ef;
  background: rgba(255, 255, 255, 0.85);
  flex-shrink: 0;
}

.sidebar-logo {
  height: 50px;
  width: auto;
  margin-left: 1rem;
  max-width: calc(100% - 32px);
}

.close-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 50%;
  box-shadow: none;
  transition: background 0.2s;
  color: #2c3e50;
  width: 32px;
  height: 32px;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 1);
}

.sidebar-menu {
  flex-grow: 1;
  overflow-y: auto;
}

.sidebar-menu ul {
  list-style: none;
  padding: 1rem 0;
  margin: 0;
}

.sidebar-menu li {
  margin-bottom: 0.5rem;
}

.menu-btn,
.admin-menu-btn {
  background: none;
  border: none;
  box-shadow: none !important;
  padding: 1rem 1.5rem;
  margin: 0;
  border-radius: 12px;
  color: #06090c;
  font: inherit;
  text-align: left;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
  font-size: 1.1rem;
  text-decoration: none;
  white-space: normal; /* allow wrapping */
  word-break: break-word;
}

.menu-btn:hover,
.admin-menu-btn:hover {
  background: #ffffffbd;
  color: #0b0c0c;
}

.user-section {
  margin-top: auto;
  padding: 1rem;
  border-top: 1px solid #e0e7ef;
  background: rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
}

.login-btn {
  display: block;
  width: 100%;
  padding: 0.75rem 1.2rem;
  background-color: #2963b3;
  border: 2px solid #2963b3;
  color: #fff;
  border-radius: 0.75rem;
  font-weight: 600;
  text-decoration: none;
  text-align: center;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(41, 99, 179, 0.2);
}

.login-btn:hover {
  background: #fff;
  color: #2963b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(41, 99, 179, 0.3);
}

.user-profile-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(44, 62, 80, 0.08);
}

.user-profile-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
}

.user-profile-header:hover {
  background: rgba(52, 152, 219, 0.05);
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #3498db;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.2);
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: #2c3e50;
  white-space: normal; /* allow wrapping so name doesn't get cut */
  overflow: visible;
  text-overflow: initial;
  word-break: break-word;
}

/* Ensure child elements use border-box sizing so padding doesn't cut content */
.sidebar,
.sidebar * {
  box-sizing: border-box;
}

/* make sure long lists have space at the bottom so last items aren't hidden */
.sidebar-menu {
  padding-bottom: 1rem;
}

/* ensure close button in rutas view won't overlap content */
.rutas-close-btn {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 5;
  background: rgba(255,255,255,0.95);
}

.user-role {
  font-size: 0.75rem;
  color: #7f8c8d;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.chevron-icon {
  color: #7f8c8d;
  transition: transform 0.3s;
  flex-shrink: 0;
}

.chevron-icon.rotated {
  transform: rotate(180deg);
}

.user-dropdown {
  border-top: 1px solid #e0e7ef;
  padding: 0.5rem;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  background: none;
  border: none;
  border-radius: 8px;
  color: #2c3e50;
  font-size: 0.95rem;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s;
  text-decoration: none;
}

.dropdown-item:hover {
  background: rgba(52, 152, 219, 0.1);
}

.logout-item {
  color: #e74c3c;
}

.logout-item:hover {
  background: rgba(231, 76, 60, 0.1);
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.rutas-close-btn {
  position: absolute;
  top: 1.2rem;
  left: 1.5rem;
  background: transparent;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #3498db;
  transition: background-color 0.2s;
}

.rutas-close-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* Scrollbar styles */
.main-menu::-webkit-scrollbar,
.rutas-menu-container::-webkit-scrollbar {
  width: 8px;
}

.main-menu::-webkit-scrollbar-track,
.rutas-menu-container::-webkit-scrollbar-track {
  background: transparent;
}

.main-menu::-webkit-scrollbar-thumb,
.rutas-menu-container::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 4px;
}

.main-menu:hover::-webkit-scrollbar-thumb,
.rutas-menu-container:hover::-webkit-scrollbar-thumb {
  background: #bdc3c7;
}

.main-menu,
.rutas-menu-container {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.main-menu:hover,
.rutas-menu-container:hover {
  scrollbar-color: #bdc3c7 transparent;
}

/* ========== ESTILOS MÓVIL ========== */
@media (max-width: 768px) {
  .sidebar {
    width: 100vw;
    left: -100vw;
    border-radius: 0;
  }
  
  .sidebar.active {
    left: 0;
  }

  .sidebar.sub-menu-active {
    width: 100vw; /* En móvil el ancho no cambia */
  }

  .sidebar-content-wrapper {
    width: 200vw; 
    transform: translateX(0);
  }

  .sidebar.sub-menu-active .sidebar-content-wrapper {
    transform: translateX(-100vw);
  }

  .main-menu,
  .rutas-menu-container {
    width: 100vw;
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .user-name {
    font-size: 0.9rem;
  }

  .user-role {
    font-size: 0.7rem;
  }
}
</style>