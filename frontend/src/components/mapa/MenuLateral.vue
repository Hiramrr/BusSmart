<template>
  <aside class="sidebar" :class="{ active: isOpen }">
    <div class="sidebar-header">
      <h2>BusSmart 🚌</h2>
      <button @click="$emit('close')" class="close-btn">✖</button>
    </div>
    <nav class="sidebar-menu">
      <ul>
        <li><a href="#">🗺️ Todas las rutas</a></li>
        <li><a href="#">⭐ Favoritos</a></li>
        <li><a href="#">⚙️ Configuración</a></li>
        <li><a href="#">❓ Ayuda</a></li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
defineProps({
  isOpen: Boolean,
});
defineEmits(['close']);
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: -300px; /* Inicia oculto */
  width: 300px;
  height: 100%;
  background-color: #fff;
  z-index: 2000;
  transition: left 0.3s ease-in-out;
  box-shadow: 4px 0 10px rgba(0,0,0,0.1);
}
.sidebar.active {
  left: 0; /* Se muestra */
}
.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}
.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
.sidebar-menu ul {
  list-style: none;
  padding: 1rem 0;
}
.sidebar-menu li a {
  display: block;
  padding: 1rem 1.5rem;
  color: #2c3e50;
  text-decoration: none;
  font-size: 1.1rem;
}
.sidebar-menu li a:hover {
  background-color: #f0f0f0;
}
</style>