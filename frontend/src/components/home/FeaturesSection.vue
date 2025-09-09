<template>
    <section id="features" class="features-grid">
      <FeatureCard
        v-for="feature in features"
        :key="feature.title"
        :icon="feature.icon"
        :title="feature.title"
        :description="feature.description"
      />
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
  </script>
  
  <style scoped>
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    padding: 60px 20px;
    max-width: 1200px;
    margin: 0 auto;
  }
  </style>