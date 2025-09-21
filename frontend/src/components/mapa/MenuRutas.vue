<template>
  <div class="menu-rutas">
    <!-- El botón de cerrar ahora está en el contenedor padre -->
    <h2>Rutas disponibles</h2>
    <div v-if="rutas.length === 0" class="sin-rutas">No hay rutas disponibles.</div>
    <div v-else>
      <div
        v-for="ruta in rutas"
        :key="ruta.id"
        class="ruta-card"
        @click="$emit('mostrar-ruta', ruta.id)"
        style="cursor:pointer;"
      >
        <div class="ruta-card-header">
          <span class="ruta-icon">🚌</span>
          <h4 class="ruta-nombre">{{ ruta.name || 'Ruta sin nombre' }}</h4>
        </div>
        <div v-if="ruta.image" class="ruta-imagen">
          <img :src="getImageUrl(ruta.image)" :alt="'Imagen de ' + (ruta.name || ruta.id)" />
        </div>
        <div class="ruta-card-body">
          <div class="ruta-id"><strong>ID:</strong> {{ ruta.id || 'N/A' }}</div>
          <div class="ruta-desc">{{ ruta.desc || 'Sin descripción' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

const props = defineProps({
  rutas: {
    type: Array,
    required: true
  }
})
const emit = defineEmits(['close', 'mostrar-ruta'])

function getImageUrl(imagePath) {
  return imagePath ? `http://localhost:3000${imagePath}` : '';
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap');
  .menu-rutas {
    position: relative;
    background: #fff;
    width: 100%;
    height: 100%;
    padding: 1rem;
    overflow-y: auto;
  }
  .close-btn {
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
  .ruta-imagen img {
    width: 100%;
    max-height: 120px;
    object-fit: contain;
    border-radius: 16px;
    margin-top: 8px;
    display: block;
    margin-left: auto;
    margin-right: auto;
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
  .sin-rutas {
    padding: 2rem;
    text-align: center;
    color: #888;
  }
</style>
