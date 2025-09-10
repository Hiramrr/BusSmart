<template>
  <aside id="sidebar" class="sidebar">
    <div class="sidebar-header">
      <h2>Menú</h2>
      <button id="close-sidebar">✖</button>
    </div>
    <nav class="sidebar-menu">
      <ul>
        <li><a href="#">Todas las rutas</a></li>
        <li><a href="#">Favoritos</a></li>
        <li><a href="#">Configuración</a></li>
        <li><a href="#">Ayuda</a></li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
const sidebar = document.getElementById('sidebar')
const openSidebarBtn = document.getElementById('open-sidebar')
const closeSidebarBtn = document.getElementById('close-sidebar')

openSidebarBtn.addEventListener('click', () => sidebar.classList.toggle('active'))
closeSidebarBtn.addEventListener('click', () => sidebar.classList.remove('active'))
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: -250px;
  width: 250px;
  height: 100%;
  background: #2c3e50;
  color: #fff;
  transition: left 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.sidebar.active {
  left: 0;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #1a252f;
}

.sidebar-header h2 {
  font-size: 1.2rem;
}

.sidebar-header button {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
}

.sidebar-menu {
  flex: 1;
  padding: 15px;
}

.sidebar-menu ul {
  list-style: none;
}

.sidebar-menu li {
  margin: 15px 0;
}

.sidebar-menu a {
  color: #fff;
  text-decoration: none;
  font-size: 1rem;
  transition: color 0.2s;
}

.sidebar-menu a:hover {
  color: #f39c12;
}
</style>
