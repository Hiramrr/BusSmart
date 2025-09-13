<script setup>
import { ref } from 'vue'
import CampoDestino from '@/components/layout/CampoDestino.vue'
import MenuLateral from '@/components/home/MenuLateral.vue'

const isMenuOpen = ref(false)

function openMenu() {
  isMenuOpen.value = true
}

function closeMenu() {
  isMenuOpen.value = false
}
</script>

<template>
  <header>
    <button class="menu-button" @click="openMenu">☰ Menú</button>
    <h1>Mapa de Rutas de Camiones en Xalapa</h1>
  </header>

  <main>
    <MenuLateral :isActive="isMenuOpen" @close="closeMenu" />
    <CampoDestino />

    <div class="map-placeholder">
      <h2>Aquí estara el mapa</h2>
    </div>
  </main>
</template>

<style scoped>
header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0 1rem;
  border-bottom: 1px solid #ddd;
}

.menu-button {
  padding: 0.5rem 1rem;
  background-color: #213261;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
}

h1 {
  text-align: center;
  margin: 1rem 0;
  color: #213261;
  flex-grow: 1;
}

main {
  padding: 1rem;
}

.map-placeholder {
  margin-top: 1.5rem;
  border: 2px dashed #ccc;
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #aaa;
}
</style>
