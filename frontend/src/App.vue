<template>
  <main>
    <RouterView />
  </main>
</template>

<script setup>
import { RouterView } from 'vue-router'
</script>

<style scoped>
main {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  overflow-y: auto;
}

.theme-toggle-container {
  position: absolute;
  top: 80px;
  right: 33px;
  z-index: 2000;
}

#app {
  /* CORREGIDO: En lugar de una altura fija, le damos una altura mínima.
     Esto permite que el contenedor crezca si el contenido es más largo que la pantalla. */
  min-height: 100vh;
  width: 100vw;
  
  /* CORREGIDO: Permitimos el scroll vertical (auto) pero ocultamos el horizontal. */
  overflow-y: auto;
  overflow-x: hidden;
}
</style>