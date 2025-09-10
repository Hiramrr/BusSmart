<script setup>
// Le decimos a Vue dónde encontrar cada componente que vamos a usar.
import TheHeader from '@/components/layout/TheHeader.vue';
import HeroSection from '@/components/home/HeroSection.vue';
import FeaturesSection from '@/components/home/FeaturesSection.vue';
</script>

<template>
  <TheHeader />
  
  <main>
    <HeroSection />
    <FeaturesSection />
  </main>
  
</template>

<style scoped>
/* Puedes añadir estilos específicos para la HomeView aquí si es necesario */
main {
  /* Ejemplo */
  padding-top: 60px; /* Evita que el contenido se oculte detrás de un header fijo */
}
</style>