<template>
  <section class="user-profile-section">
    <div class="profile-container">
      <!-- Perfil simple -->
      <div class="profile-card">
        <img
          :src="user?.profile?.picture || 'https://via.placeholder.com/120'"
          alt="Foto de perfil"
          class="profile-picture"
        />
        <h1>{{ user?.profile?.name || 'Usuario' }}</h1>
        <p class="email">{{ user?.profile?.email || 'email@ejemplo.com' }}</p>
        <div class="badges">
          <span class="badge badge-admin" v-if="isAdmin">👑 Administrador</span>
        </div>
      </div>

      <!-- Rutas favoritas -->
      <div class="favorites-card">
        <h2>⭐ Rutas Favoritas</h2>

        <!-- Loading -->
        <div v-if="loadingFavoritos" class="loading-state">
          <div class="spinner"></div>
          <p>Cargando favoritos...</p>
        </div>

        <!-- Sin favoritos -->
        <div v-else-if="rutasFavoritas.length === 0" class="empty-state">
          <p class="placeholder-text">Aún no tienes rutas favoritas</p>
          <router-link to="/map" class="btn-explore">Explorar rutas</router-link>
        </div>

        <!-- Lista de favoritos -->
        <div v-else class="favoritos-list">
          <div
            v-for="ruta in rutasFavoritas"
            :key="ruta.id"
            class="ruta-favorita-card"
            @click="irARuta(ruta.id)"
          >
            <div class="ruta-header">
              <span class="ruta-icon">🚌</span>
              <div class="ruta-info">
                <h3>{{ ruta.name || 'Ruta sin nombre' }}</h3>
                <span class="ruta-id">ID: {{ ruta.id }}</span>
              </div>
              <button
                @click.stop="quitarDeFavoritos(ruta.id)"
                class="btn-remove"
                title="Quitar de favoritos"
              >
                ✕
              </button>
            </div>

            <div v-if="ruta.image" class="ruta-imagen">
              <img
                :src="getImageUrl(ruta.image)"
                :alt="'Imagen de ' + (ruta.name || ruta.id)"
                loading="lazy"
                @error="handleImageError"
              />
            </div>

            <p v-if="ruta.desc" class="ruta-desc">{{ ruta.desc }}</p>

            <div class="ruta-badges">
              <span v-if="ruta.mujer === 'true'" class="badge-mujer" title="Ruta para mujer">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="10" cy="7" r="5" stroke="currentColor" stroke-width="2" fill="none" />
                  <line x1="10" y1="12" x2="10" y2="18" stroke="currentColor" stroke-width="2" />
                  <line x1="7" y1="15" x2="13" y2="15" stroke="currentColor" stroke-width="2" />
                </svg>
                Ruta para mujer
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/componibles/useAuth.js'
import { obtenerFavoritos, quitarFavorito, getRutas } from '@/services/api.js'
import { getImageUrl } from '@/config.js'

const { user, isAuthenticated, isAdmin } = useAuth()
const router = useRouter()

const rutasFavoritas = ref([])
const loadingFavoritos = ref(true)

// Cargar rutas favoritas (igual que MenuRutas)
const cargarRutasFavoritas = async () => {
  if (!isAuthenticated.value) {
    loadingFavoritos.value = false
    return
  }

  try {
    loadingFavoritos.value = true

    // 1. Obtener los IDs de favoritos del usuario
    const respuesta = await obtenerFavoritos()
    const favoritosIds = respuesta.rutasFavoritas || []

    console.log('✅ IDs de favoritos:', favoritosIds)

    // 2. Obtener TODAS las rutas (igual que MenuRutas)
    const todasLasRutas = await getRutas()

    console.log('✅ Total de rutas disponibles:', todasLasRutas.length)

    // 3. Filtrar solo las rutas que están en favoritos
    rutasFavoritas.value = todasLasRutas.filter((ruta) => favoritosIds.includes(ruta.id))

    console.log('✅ Rutas favoritas encontradas:', rutasFavoritas.value.length)
    console.log('📋 Rutas favoritas:', rutasFavoritas.value)
  } catch (error) {
    console.error('❌ Error al cargar favoritos:', error)
    rutasFavoritas.value = []
  } finally {
    loadingFavoritos.value = false
  }
}

// Quitar ruta de favoritos
const quitarDeFavoritos = async (rutaId) => {
  try {
    await quitarFavorito(rutaId)
    rutasFavoritas.value = rutasFavoritas.value.filter((ruta) => ruta.id !== rutaId)
    console.log('⭐ Favorito removido:', rutaId)
  } catch (error) {
    console.error('❌ Error al quitar favorito:', error)
    alert('Error al quitar de favoritos. Inténtalo de nuevo.')
  }
}

// Ir a la ruta en el mapa
const irARuta = (rutaId) => {
  router.push({
    path: '/map',
    query: { rutaId },
  })
}

// Manejar error de imagen
const handleImageError = (event) => {
  event.target.style.display = 'none'
}

onMounted(() => {
  cargarRutasFavoritas()
})
</script>

<style scoped>
.user-profile-section {
  min-height: calc(100vh - 70px);
  background: #f5f7fa;
  padding: 3rem 1rem;
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
}

.profile-card {
  background: white;
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
  border: 1px solid #e8ecef;
}

.profile-picture {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #3498db;
  margin-bottom: 1.5rem;
}

.profile-card h1 {
  font-size: 1.75rem;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.email {
  color: #7f8c8d;
  font-size: 1rem;
  margin: 0 0 1rem 0;
}

.badges {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.badge {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
}

.badge-admin {
  background: #3498db;
  color: white;
}

/* Rutas favoritas */
.favorites-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8ecef;
}

.favorites-card h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  font-weight: 600;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 2rem 1rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e8ecef;
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.placeholder-text {
  color: #7f8c8d;
  margin: 0 0 1.5rem 0;
}

.btn-explore {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: background 0.3s;
}

.btn-explore:hover {
  background: #2980b9;
}

/* Lista de favoritos */
.favoritos-list {
  display: grid;
  gap: 1rem;
}

.ruta-favorita-card {
  background: linear-gradient(135deg, #e3f0ff 0%, #f9f9f9 100%);
  border-radius: 12px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #e8ecef;
}

.ruta-favorita-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.15);
}

.ruta-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.ruta-icon {
  font-size: 2rem;
  background: white;
  padding: 0.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.1);
}

.ruta-info {
  flex: 1;
}

.ruta-info h3 {
  font-size: 1.1rem;
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
  font-weight: 600;
}

.ruta-id {
  font-size: 0.875rem;
  color: #3498db;
  font-weight: 500;
}

.btn-remove {
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.btn-remove:hover {
  background: #c0392b;
  transform: scale(1.1);
}

.ruta-imagen {
  margin: 0.75rem 0;
  text-align: center;
}

.ruta-imagen img {
  max-width: 150px;
  height: auto;
  border-radius: 8px;
  object-fit: contain;
}

.ruta-desc {
  color: #555;
  font-size: 0.9rem;
  margin: 0.5rem 0;
  line-height: 1.5;
}

.ruta-badges {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.badge-mujer {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  background: #f3e5f5;
  color: #a259d9;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .user-profile-section {
    padding: 2rem 1rem;
  }

  .profile-card {
    padding: 2rem 1.5rem;
  }

  .profile-card h1 {
    font-size: 1.5rem;
  }

  .favorites-card {
    padding: 1.5rem;
  }
}
</style>
