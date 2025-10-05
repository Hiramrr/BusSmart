<template>
  <header>
    <nav class="nav-container">
      <router-link to="/"  class="logo">
        <img src="C:\Users\belli\OneDrive\Escritorio\BusSmrt\BusSmart\frontend\src\components\home\LogoTransparente.png" alt="">
      </router-link>

      <button class="menu-toggle" @click="toggleMobileMenu" aria-label="Menú">
        <svg
          v-if="!mobileMenuOpen"
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <div class="nav-right" :class="{ 'mobile-open': mobileMenuOpen }">
        <ul class="nav-links">
          <li><a href="#features" @click="closeMobileMenu">Características</a></li>
          <li>
            <router-link to="/map" class="nav-link" @click="closeMobileMenu">Mapa</router-link>
          </li>
          <li><a href="#descargar" @click="closeMobileMenu">Descargar</a></li>
          <li>
            <a
              href="https://github.com/Hiramrr/BusSmart"
              target="_blank"
              rel="noopener noreferrer"
              @click="closeMobileMenu"
              >Contacto</a
            >
          </li>
        </ul>

        <template v-if="isInitialized">
        <router-link
            v-if="!isAuthenticated"
            to="/login"
            class="login-btn"
            @click="closeMobileMenu"
          >
            Iniciar sesión
          </router-link>

          <div v-else class="user-profile-wrapper">
            <div class="user-profile" @click="toggleMenu">
              <img
                :src="user?.profile?.picture || 'https://via.placeholder.com/40'"
                :alt="user?.profile?.name || 'Usuario'"
                class="user-avatar"
              />
              <span class="user-name">{{ user?.profile?.name || 'Usuario' }}</span>
              <svg
                class="chevron-icon"
                :class="{ rotated: showMenu }"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>

            <transition name="dropdown-fade">
              <div v-if="showMenu" class="user-dropdown">
                <div class="dropdown-header">
                  <img
                    :src="user?.profile?.picture || 'https://via.placeholder.com/48'"
                    :alt="user?.profile?.name || 'Usuario'"
                    class="dropdown-avatar"
                  />
                  <div class="dropdown-info">
                    <span class="dropdown-name">{{ user?.profile?.name || 'Usuario' }}</span>
                    <span class="dropdown-email">{{ user?.profile?.email || '' }}</span>
                  </div>
                </div>

                <div class="dropdown-divider"></div>

                <router-link to="/perfil" class="dropdown-item" @click="closeMenu">
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

                <router-link v-if="isAdmin" to="/admin" class="dropdown-item" @click="closeMenu">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"></path>
                  </svg>
                  Panel Admin
                </router-link>

                <div class="dropdown-divider"></div>

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
        </template>
      </div>

      <div
        class="mobile-overlay"
        :class="{ active: mobileMenuOpen }"
        @click="closeMobileMenu"
      ></div>
    </nav>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useAuth } from '@/componibles/useAuth.js'
import { useRouter } from 'vue-router'

const { user, isAuthenticated, isAdmin, logout, isInitialized } = useAuth()
const router = useRouter()

const showMenu = ref(false)
const mobileMenuOpen = ref(false)

function toggleMenu() {
  showMenu.value = !showMenu.value
}

function closeMenu() {
  showMenu.value = false
  closeMobileMenu()
}

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

function handleLogout() {
  closeMenu()
  logout()
}

// Cerrar menú al hacer clic fuera
const handleClickOutside = (event) => {
  const dropdown = document.querySelector('.user-profile-wrapper')
  const menuToggle = document.querySelector('.menu-toggle')

  if (dropdown && !dropdown.contains(event.target) && !menuToggle?.contains(event.target)) {
    showMenu.value = false
  }
}

// Cerrar menú móvil al cambiar de ruta
watch(
  () => router.currentRoute.value.path,
  () => {
    closeMobileMenu()
  },
)

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* ... (estilos sin cambios) ... */
header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  padding: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  width: 100%;
  box-sizing: border-box;
  position: relative;
}

.logo {
  font-weight: 700;
  font-size: 1.5rem;
  color: #2963b3;
  text-decoration: none;
  transition: color 0.3s;
  z-index: 102;
  /* Definimos un contenedor para la imagen */
  width: 150px; /* Ancho del contenedor */
  height: 45px; /* Alto del contenedor */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden; /* Ocultamos lo que se salga del contenedor */
}

.logo img {
  /* Hacemos la imagen ancha como el contenedor y la escalamos verticalmente para recortar arriba y abajo */
  width: 100%;
  height: auto;
  transform: scaleY(1.2); /* Ajusta este valor para 'recortar' más o menos verticalmente */
}

.logo:hover {
  color: #3498db;
}

/* Botón menú móvil */
.menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  z-index: 102;
  color: #2963b3;
  transition: color 0.3s;
}

.menu-toggle:hover {
  color: #3498db;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 1.5rem;
  margin: 0;
  padding: 0;
  align-items: center;
}

.nav-links a {
  text-decoration: none;
  color: #2963b3;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: #fdfaff;
}

.login-btn {
  padding: 0.5rem 1.2rem;
  background-color: #2963b3;
  border: 2px solid #2963b3;
  color: #fff;
  border-radius: 0.5rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(41, 99, 179, 0.08);
  cursor: pointer;
  white-space: nowrap;
}

.login-btn:hover {
  background: #fff;
  color: #2963b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(41, 99, 179, 0.2);
}

/* Perfil de usuario */
.user-profile-wrapper {
  position: relative;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.user-profile:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(41, 99, 179, 0.3);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #3498db;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
}

.user-name {
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chevron-icon {
  color: white;
  transition: transform 0.3s;
  flex-shrink: 0;
}

.chevron-icon.rotated {
  transform: rotate(180deg);
}

/* Menú desplegable */
.user-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 280px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 1000;
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.dropdown-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  flex-shrink: 0;
}

.dropdown-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
}

.dropdown-name {
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-email {
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.8rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-divider {
  height: 1px;
  background: #e8ecef;
  margin: 0.5rem 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.875rem 1.25rem;
  background: none;
  border: none;
  color: #2c3e50;
  font-size: 0.95rem;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s;
  text-decoration: none;
  text-align: left;
}

.dropdown-item:hover {
  background: rgba(52, 152, 219, 0.08);
}

.logout-item {
  color: #e74c3c;
}

.logout-item:hover {
  background: rgba(231, 76, 60, 0.08);
}

/* Animación del menú desplegable */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.3s ease;
}

.dropdown-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.mobile-overlay {
  display: none;
}

/* Responsive Design - Mobile */
@media (max-width: 968px) {
  .nav-container {
    padding: 1rem 1.5rem;
  }

  .menu-toggle {
    display: block;
  }

  .mobile-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s;
    z-index: 99;
  }

  .mobile-overlay.active {
    opacity: 1;
    visibility: visible;
  }

  .nav-right {
    position: fixed;
    top: 0;
    right: -100%;
    width: 300px;
    height: 100vh;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(10px);
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    padding: 5rem 0 2rem 0;
    transition: right 0.3s ease;
    z-index: 101;
    overflow-y: auto;
  }

  .nav-right.mobile-open {
    right: 0;
  }

  .nav-links {
    flex-direction: column;
    gap: 0;
    width: 100%;
    padding: 1rem 0;
  }

  .nav-links li {
    width: 100%;
  }

  .nav-links a {
    display: block;
    padding: 1rem 2rem;
    color: white;
    font-size: 1.05rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .nav-links a:hover {
    background: rgba(41, 99, 179, 0.2);
    color: white;
  }

  .login-btn {
    margin: 1.5rem 2rem;
    text-align: center;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }

  .user-profile-wrapper {
    padding: 1.5rem 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .user-profile {
    width: 100%;
    justify-content: flex-start;
    background: rgba(255, 255, 255, 0.05);
    padding: 0.75rem 1rem;
  }

  .user-name {
    display: block;
    max-width: none;
  }

  .user-dropdown {
    position: static;
    margin-top: 1rem;
    width: 100%;
    box-shadow: none;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .dropdown-header {
    padding: 1rem;
  }

  .dropdown-item {
    padding: 0.75rem 1rem;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 1rem;
  }

  .logo {
    font-size: 1.3rem;
  }

  .nav-right {
    width: 100%;
    right: -100%;
  }

  .nav-links a {
    font-size: 1rem;
    padding: 0.875rem 1.5rem;
  }

  .login-btn {
    margin: 1.5rem 1.5rem;
  }

  .user-profile-wrapper {
    padding: 1.5rem 1.5rem;
  }
}
</style>