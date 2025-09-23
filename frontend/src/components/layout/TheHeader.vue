<template>
  <header>
    <nav class="nav-container">
      <div class="logo">BusSmart</div>
      <div class="nav-right">
        <ul class="nav-links">
          <li><a href="#features">Características</a></li>
          <li><router-link to="/map" class="nav-link">Mapa</router-link></li>
          <li><a href="#descargar">Descargar</a></li>
          <li><a href="#contacto">Contacto</a></li>

          <li v-if="isAuthenticated"><a href="#usuario"> Usuario</a></li>
        </ul>

        <template v-if="isInitialized">
          <router-link v-if="!isAuthenticated" to="/login" class="login-btn">
            Iniciar sesion
          </router-link>

          <div v-else class="user-profile">
            <span class="usuario" @click="Pagina_Usuario">Bienvenido, {{ user.profile.name }}</span>
            <button @click="logout" class="logout-btn">Cerrar Sesion</button>
          </div>
        </template>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { useAuth } from '@/componibles/useAuth.js'
import { useRouter } from 'vue-router'

const { user, isAuthenticated, logout, isInitialized } = useAuth()

const router = useRouter()

function Pagina_Usuario() {
  router.push('perfil')
}
</script>

<style scoped>
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
}

.logo {
  font-weight: 700;
  font-size: 1.5rem;
  color: #2963b3;
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
  transition:
    background 0.3s,
    color 0.3s;
  box-shadow: 0 2px 8px rgba(41, 99, 179, 0.08);
  cursor: pointer;
  margin-left: 1.5rem;
  white-space: nowrap;
}
.login-btn:hover {
  background: #fff;
  color: #2963b3;
  border: 2px solid #2963b3;
}
.logout-btn {
  padding: 0.5rem 1.2rem;
  background-color: #d9534f;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}
.logout-btn:hover {
  background-color: #c9302c;
}

.usuario {
  color: white;
}
</style>
