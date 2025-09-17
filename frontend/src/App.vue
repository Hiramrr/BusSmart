<template>
  <main>
    <RouterView />
  </main>
  <div id="app">
    <div v-if="$auth.loading">Cargando...</div>

    <div v-if="!$auth.isAuthenticated">
      <button @click="$auth.loginWithRedirect()">Iniciar Sesión</button>
    </div>

    <div v-if="$auth.isAuthenticated">
      <h2>¡Hola, {{ $auth.user.name }}!</h2>
      <button @click="$auth.logout()">Cerrar Sesión</button>
    </div>
  </div>
</template>

<script setup>
// Importas los componentes que uses aquí
import { RouterView } from 'vue-router'
</script>
<style scoped>
/* Estilos para el layout principal */
</style>
