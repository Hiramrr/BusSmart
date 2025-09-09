<template>
  <TheHeader />

  <main>
    <RouterView />
  </main>
  
  <TheFooter />
</template>

<script setup>
// Importas los componentes que uses aquí
import TheHeader from './components/layout/TheHeader.vue'
import TheFooter from './components/layout/TheFooter.vue'
import { RouterView } from 'vue-router'
</script>
<style scoped>
/* Estilos para el layout principal */
</style>