<template>
  <section id="features" class="features-grid-section">
    <div class="features-header">
      <h2 class="autoBlur">Características Principales</h2>
      <p class="autoBlur">Todo lo que necesitas para navegar por la ciudad</p>
    </div>
    <div class="features-grid">
      <FeatureCard
        v-for="feature in features"
        :key="feature.title"
        :icon="feature.icon"
        :title="feature.title"
        :description="feature.description"
      />
    </div>

    <!-- Sección de logos de tecnologías -->
    <div class="tech-logos-section">
      <h3>Tecnologías Utilizadas</h3>
      <div class="tech-logos-grid">
        <div 
          v-for="logo in techLogos" 
          :key="logo.name"
          class="tech-logo-item"
          :title="logo.name"
        >
          <img :src="logo.url" :alt="logo.name" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
// 1. Importamos el componente hijo para poder usarlo en el template.
import FeatureCard from './FeatureCard.vue';

// 2. Definimos los datos de todas nuestras características en un solo lugar.
const features = ref([
  {
    icon: '🗺️',
    title: 'Mapa interactivo',
    description: 'Explora todas las rutas de camiones con paradas marcadas en un mapa claro y fácil de usar.',
  },
  {
    icon: '🔍',
    title: 'Búsqueda rápida',
    description: 'Encuentra la mejor ruta por colonia, destino o número de camión en segundos.',
  },
  {
    icon: '⭐',
    title: 'Favoritos',
    description: 'Guarda tus rutas más utilizadas para acceder a ellas de forma instantánea.',
  },
  {
    icon: '📱',
    title: 'Acceso móvil',
    description: 'Consulta rutas y paradas desde cualquier dispositivo, en cualquier momento.',
  },
  {
    icon: '🕒',
    title: 'Actualizaciones en tiempo real',
    description: 'Recibe información actualizada sobre rutas y horarios al instante.',
  },
  {
    icon: '💡',
    title: 'Recomendaciones inteligentes',
    description: 'Obtén sugerencias personalizadas para optimizar tus trayectos.',
  },
]);

// Logos de tecnologías (reemplaza las URLs con las de tus logos)
const techLogos = ref([
  { name: 'MongoDB', url: 'https://cdn.worldvectorlogo.com/logos/mongodb-icon-1.svg' },
  { name: 'Vue', url: 'https://images.seeklogo.com/logo-png/27/1/vue-js-logo-png_seeklogo-274070.png' },
  { name: 'Vite', url: 'https://img.icons8.com/?size=1200&id=dJjTWMogzFzg&format=png' },
  { name: 'JavaScript', url: 'https://static.vecteezy.com/system/resources/previews/027/127/463/non_2x/javascript-logo-javascript-icon-transparent-free-png.png' },
  { name: 'Express', url: 'data:image/png;base64,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' },
  { name: 'VS code', url: 'data:image/jpeg;base64,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' },
  { name: 'GitHub', url: 'data:image/png;base64,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' },
]);
</script>

<style scoped>
.features-grid-section {
  padding: 80px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.features-header {
  text-align: center;
  margin-bottom: 50px;
}

.features-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
}

.features-header p {
  font-size: 1.1rem;
  color: #64748b;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  padding: 60px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Sección de logos */
.tech-logos-section {
  margin-top: 80px;
  text-align: center;
}

.tech-logos-section h3 {
  font-size: 2rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 40px;
}

.tech-logos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 32px;
  align-items: center;
  justify-items: center;
}

.tech-logo-item {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
}

.tech-logo-item:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.tech-logo-item img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: grayscale(20%);
  transition: filter 0.3s ease;
}

.tech-logo-item:hover img {
  filter: grayscale(0%);
}
</style>