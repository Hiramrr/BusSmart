<template>
  <div class="admin-container" :class="{ 'theme-dark': isDarkTheme }">
    <header class="admin-header">
      <h1>Panel de Administración</h1>
      <p>Gestiona las rutas y paradas de BusSmart.</p>
    </header>
    <main class="admin-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
// En un futuro, podrías pasar el tema como prop o leerlo de una store.
const isDarkTheme = false; 
</script>

<style scoped>
.admin-container {
  padding: 2rem;
  font-family: 'Montserrat', sans-serif;
  background-color: #f4f7f9;
  min-height: 100vh;
}
.admin-container.theme-dark {
  background-color: #1a1a1a;
  color: #f0f0f0;
}
.admin-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e7ef;
}
.theme-dark .admin-header {
  border-bottom-color: #333;
}
.admin-header h1 {
  font-size: 2.5rem;
  font-weight: 600;
  color: #3498db;
}
.theme-dark .admin-header h1 {
  color: #64b5f6;
}
</style>