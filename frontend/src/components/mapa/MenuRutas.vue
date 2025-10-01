<template>
  <div class="menu-rutas" :class="{ 'theme-dark': isDarkTheme }">
    <div
      style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
      "
    >
      <h2 style="margin: 0">Rutas disponibles</h2>
      <button
        class="filtro-mujer-btn"
        :class="{ activo: soloMujer }"
        @click="toggleFiltroMujer"
        style="background: none; border: none; cursor: pointer; padding: 0; margin-left: 12px"
        title="Mostrar solo rutas de mujer"
      >
        <span class="filtro-mujer-circulo" :class="{ activo: soloMujer }">
          <svg
            width="28"
            height="28"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="10" cy="10" r="10" :fill="soloMujer ? '#A259D9' : '#888'" />
            <circle cx="10" cy="7" r="5" stroke="#fff" stroke-width="2" fill="none" />
            <line x1="10" y1="12" x2="10" y2="18" stroke="#fff" stroke-width="2" />
            <line x1="7" y1="15" x2="13" y2="15" stroke="#fff" stroke-width="2" />
          </svg>
        </span>
      </button>
    </div>
    <div v-if="rutasFiltradas.length === 0" class="sin-rutas">No hay rutas disponibles.</div>
    <div v-else>
      <div
        v-for="ruta in rutasFiltradas"
        :key="ruta.id"
        class="ruta-card"
        @click="$emit('mostrar-ruta', ruta.id)"
      >
        <div class="ruta-card-header" style="cursor: pointer">
          <span class="ruta-icon">🚌</span>
          <h4 class="ruta-nombre">
            {{ ruta.name || 'Ruta sin nombre' }}
          </h4>
        </div>
        <div v-if="ruta.image" class="ruta-imagen">
          <img :src="getImageUrl(ruta.image)" :alt="'Imagen de ' + (ruta.name || ruta.id)" />
        </div>
        <div class="ruta-card-body">
          <div class="ruta-id"><strong>ID:</strong> {{ ruta.id || 'N/A' }}</div>
          <div class="ruta-desc">{{ ruta.desc || 'Sin descripción' }}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; margin-top: 0.5rem">
          <button
            class="favorito-btn"
            :class="{ activo: esFavorito(ruta.id) }"
            @click.stop="manejarClicFavorito(ruta)"
            :aria-label="esFavorito(ruta.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'"
          >
            <span class="estrella-icon" v-if="esFavorito(ruta.id)">&#9733;</span>
            <span class="estrella-icon" v-else>&#9734;</span>
          </button>
          <span v-if="ruta.mujer === 'true'" class="mujer-icon" title="Ruta para mujer">
            <svg
              width="28"
              height="28"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="10" cy="7" r="5" stroke="#A259D9" stroke-width="2" fill="none" />
              <line x1="10" y1="12" x2="10" y2="18" stroke="#A259D9" stroke-width="2" />
              <line x1="7" y1="15" x2="13" y2="15" stroke="#A259D9" stroke-width="2" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '../../componibles/useAuth.js'
import { agregarFavorito, quitarFavorito, obtenerFavoritos } from '../../services/api.js'

const { user, isAuthenticated } = useAuth()

const props = defineProps({
  rutas: {
    type: Array,
    required: true,
  },

})

const emit = defineEmits(['close', 'mostrar-ruta'])

// Estado local
const soloMujer = ref(false)
const favoritos = ref([])

// Filtro de rutas por género
function toggleFiltroMujer() {
  soloMujer.value = !soloMujer.value
}

const rutasFiltradas = computed(() => {
  if (soloMujer.value) {
    return props.rutas.filter((r) => r.mujer === 'true')
  }
  return props.rutas
})

// Cargar favoritos del usuario
const cargarFavoritos = async () => {
  if (!isAuthenticated.value) return

  try {
    const respuesta = await obtenerFavoritos()
    favoritos.value = respuesta.rutasFavoritas || []
    console.log('✅ Favoritos cargados:', favoritos.value)
  } catch (error) {
    console.error('❌ Error al cargar favoritos:', error)
    favoritos.value = []
  }
}

// Verificar si una ruta es favorita
const esFavorito = (rutaId) => {
  return favoritos.value.includes(rutaId)
}

// Manejar clic en botón de favorito
const manejarClicFavorito = async (ruta) => {
  if (!isAuthenticated.value) {
    console.error('❌ Usuario no autenticado')
    alert('Debes iniciar sesión para agregar favoritos')
    return
  }

  try {
    const rutaId = ruta.id

    if (esFavorito(rutaId)) {
      await quitarFavorito(rutaId)
      favoritos.value = favoritos.value.filter((id) => id !== rutaId)
      console.log('⭐ Favorito removido:', rutaId)
    } else {
      await agregarFavorito(rutaId)
      favoritos.value.push(rutaId)
      console.log('⭐ Favorito agregado:', rutaId)
    }
  } catch (error) {
    console.error('❌ Error al manejar favorito:', error)
    alert('Error al actualizar favorito. Inténtalo de nuevo.')
  }
}

// Obtener URL de imagen
function getImageUrl(imagePath) {
  return imagePath ? `http://localhost:3000${imagePath}` : ''
}

// Cargar favoritos al montar el componente
onMounted(() => {
  cargarFavoritos()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap');

.filtro-mujer-circulo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: none;
  transition: box-shadow 0.2s;
}

.filtro-mujer-circulo.activo {
  box-shadow: 0 0 0 3px #88888844;
}

.filtro-mujer-btn.activo {
  background: #fff;
  color: #a259d9;
  border: 2px solid #a259d9;
}

.menu-rutas {
  position: relative;
  width: 350px;
  min-width: 300px;
  height: 100%;
  padding: 1rem;
  overflow-y: auto;
  font-family: 'Montserrat', Arial, sans-serif;
  background: #fff;
  color: #2c3e50;
}

.menu-rutas.theme-dark {
  background: #1e1e1e;
  color: #f0f0f0;
}

.ruta-card {
  border-radius: 16px;
  margin-bottom: 1.2rem;
  padding: 1.2rem 1.4rem;
  box-shadow: 0 4px 16px rgba(44, 62, 80, 0.08);
  transition: transform 0.15s;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: linear-gradient(135deg, #e3f0ff 0%, #f9f9f9 100%);
}

.menu-rutas.theme-dark .ruta-card {
  background: linear-gradient(135deg, #333 0%, #2a2a2a 100%);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.ruta-card:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 24px rgba(44, 62, 80, 0.12);
}

.menu-rutas.theme-dark .ruta-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
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
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.08);
  padding: 0.2rem 0.4rem;
}

.menu-rutas.theme-dark .ruta-icon {
  background: #1e1e1e;
}

.ruta-nombre {
  font-size: 1.15rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-rutas.theme-dark .ruta-nombre {
  color: #f0f0f0;
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

.menu-rutas.theme-dark .ruta-id {
  color: #64b5f6;
}

.ruta-desc {
  font-size: 0.9rem;
  color: #555;
  margin-top: 0.2rem;
}

.menu-rutas.theme-dark .ruta-desc {
  color: #a0a0a0;
}

.ruta-imagen {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 8px;
}

.ruta-imagen img {
  width: 100%;
  max-width: 150px;
  height: auto;
  object-fit: contain;
  border-radius: 16px;
}

.sin-rutas {
  padding: 2rem;
  text-align: center;
  color: #888;
}

.menu-rutas.theme-dark .sin-rutas {
  color: #a0a0a0;
}

.favorito-btn {
  margin-top: 0.5rem;
  background: #fff;
  border: 1px solid #ffd700;
  color: #ffd700;
  border-radius: 8px;
  padding: 0.4rem 1rem;
  font-size: 1.4rem;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
}

.menu-rutas.theme-dark .favorito-btn {
  background: #2a2a2a;
  border-color: #ffd700;
  color: #ffd700;
}

.favorito-btn.activo {
  background: #ffd700;
  color: #fff;
  font-weight: bold;
}

.menu-rutas.theme-dark .favorito-btn.activo {
  background: #ffd700;
  color: #fff;
}

.estrella-icon {
  font-size: 1.6rem;
  pointer-events: none;
}

.mujer-icon {
  display: inline-block;
  vertical-align: middle;
  margin-left: 8px;
}
</style>
