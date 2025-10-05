<template>
  <aside class="sidebar" :class="{ active: isOpen }">
    <div
      class="sidebar-content-wrapper"
      :class="{ 'sub-menu-active': mostrarMenuRutas || mostrarFavoritos || mostrarForo }"
    >
      <div class="main-menu">
        <div class="sidebar-header">
          <h2>BusSmart 🚌</h2>
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
  width: 300px;
  height: 100%;
  z-index: 2000;
  border-radius: 20px;
  transition: left 0.4s cubic-bezier(0.77, 0, 0.18, 1);
  box-shadow: 8px 0 24px rgba(44, 62, 80, 0.12);
  font-family: 'Montserrat', Arial, sans-serif;
  color: #2c3e50;
}

.sidebar.active {
  left: 0;
  color: #2c3e50;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 8px 0 24px rgba(44, 62, 80, 0.25);
}

.sidebar-content-wrapper {
  position: relative;
  width: 200%;
  height: 100%;
  display: flex;
  transition: transform 0.4s cubic-bezier(0.77, 0, 0.18, 1);
}

.sidebar-content-wrapper.sub-menu-active {
  transform: translateX(-50%);
}

.main-menu {
  width: 50%;
  flex-shrink: 0;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.rutas-menu-container {
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
  padding: 1.2rem 1rem;
  border-bottom: 1px solid #e0e7ef;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 2px 8px rgba(44, 62, 80, 0.04);
}

.sidebar-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #3498db;
  letter-spacing: 1px;
  margin: 0;
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
  flex: 1;
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

.menu-btn {
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
}

.menu-btn:hover {
  background: #ffffffbd;
  color: #0b0c0c;
}

/* Sección de usuario */
.user-section {
  margin-top: auto;
  padding: 1rem;
  border-top: 1px solid #e0e7ef;
  background: rgba(255, 255, 255, 0.6);
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

/* Animación del menú desplegable */
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

.rutas-menu-container {
  position: fixed;
  top: 0;
  left: 300px;
  width: 30vw;
  height: 100vh;
  background: linear-gradient(135deg, #f9f9f9 0%, #e3f0ff 100%);
  z-index: 2100;
  box-shadow: 8px 0 24px rgba(44, 62, 80, 0.12);
  border-top-right-radius: 24px;
  border-bottom-right-radius: 24px;
  animation: fadeInMenuRutas 0.4s cubic-bezier(0.77, 0, 0.18, 1);
  overflow-y: auto;
  padding: 4rem 1.5rem 1rem 3.5rem;
}

@keyframes fadeInMenuRutas {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.rutas-close-btn {
  position: absolute;
  top: 1.2rem;
  left: 1rem;
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
  transition:
    background-color 0.2s,
    color 0.2s;
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

@media (max-width: 768px) {
  .sidebar {
    width: 100vw;
    left: -100vw;
    border-radius: 0;
  }

  .sidebar.active {
    left: 0;
  }

  .sidebar-header h2 {
    font-size: 1.3rem;
  }

  .menu-btn {
    padding: 0.85rem 1.2rem;
    font-size: 1rem;
  }

  .user-profile-header {
    padding: 0.65rem;
  }

  .user-avatar {
    width: 42px;
    height: 42px;
  }

  .user-name {
    font-size: 0.9rem;
  }

  .user-role {
    font-size: 0.7rem;
  }

  .rutas-menu-container {
    left: 100vw;
    width: 100vw;
    border-radius: 0;
    padding: 3.5rem 1rem 1rem 1rem;
  }

  .sidebar-content-wrapper.sub-menu-active .main-menu {
    transform: translateX(-100vw);
  }
}

@media (max-width: 480px) {
  .sidebar-header {
    padding: 1rem 0.75rem;
  }

  .sidebar-header h2 {
    font-size: 1.2rem;
  }

  .menu-btn {
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
    gap: 0.5rem;
  }

  .user-section {
    padding: 0.75rem;
  }

  .login-btn {
    padding: 0.65rem 1rem;
    font-size: 0.95rem;
  }

  .dropdown-item {
    padding: 0.65rem;
    font-size: 0.9rem;
  }
}
</style>
