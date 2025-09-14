<script setup>
import { ref } from 'vue'
import ControlesBusqueda from '@/components/mapa/ControlesBusqueda.vue'
import MenuLateral from '@/components/mapa/MenuLateral.vue'
import MapaContenedor from '@/components/mapa/MapaContenedor.vue'

const isMenuOpen = ref(false)
const mapaRef = ref(null)

function dibujarLaRutaEnElMapa(geojsonData) {
  if (mapaRef.value) {
    mapaRef.value.dibujarRuta(geojsonData)
  }
}

function openMenu() {
  isMenuOpen.value = true
}

function closeMenu() {
  isMenuOpen.value = false
}
</script>

<template>
  <div class="vista-mapa-principal">
    <MenuLateral :isActive="isMenuOpen" @close="closeMenu" />

    <div class="contenido-principal" :class="{ 'menu-abierto': isMenuOpen }">
      <header>
        <button class="menu-button" @click="openMenu">☰ Menú</button>
        <h1>Mapa de Rutas de Camiones en Xalapa</h1>
      </header>

      <main>
        <ControlesBusqueda @rutaEncontrada="dibujarLaRutaEnElMapa" />

        <div class="mapa-wrapper">
          <MapaContenedor ref="mapaRef" />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.vista-mapa-principal {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.contenido-principal {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.contenido-principal.menu-abierto {
  transform: translateX(250px);
}

header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #ddd;
  background: #fff;
  flex-shrink: 0;
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
  margin: 0;
  color: #213261;
  flex-grow: 1;
  font-size: 1.2rem;
}

main {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
}

.mapa-wrapper {
  flex-grow: 1;
  width: 100%;
  height: 100%;
}
</style>
