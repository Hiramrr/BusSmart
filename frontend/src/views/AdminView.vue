<template>
  <div class="admin-container">
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
</script>

<style scoped>
.admin-container {
  box-sizing: border-box; /* AÑADIDO: Asegura que el padding no afecte la altura total */
  padding: 2rem;
  font-family: 'Montserrat', sans-serif;
  background-color: #f4f7f9;
  min-height: 100vh;
  width: 100%; /* AÑADIDO: Asegura que ocupe todo el ancho disponible */
}
.admin-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e7ef;
}
.admin-header h1 {
  font-size: 2.5rem;
  font-weight: 600;
  color: #3498db;
}
</style>