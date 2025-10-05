<template>
  <div class="dropdown" @click="open = !open">
    <a href="#contacto" class="dropdown-toggle">
      Contacto
      <span class="arrow" :class="{ open: open }">▼</span>
    </a>
    <div v-if="open" class="dropdown-menu">
      <a
        href="https://github.com/Hiramrr/BusSmart"
        target="_blank"
        rel="noopener noreferrer"
        class="dropdown-item"
      >
        <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Logo.png" alt="GitHub" class="icon" />
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const open = ref(false)
</script>

<style scoped>
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-toggle {
  text-decoration: none;
  color: #2963b3;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: color 0.3s;
}

.dropdown-toggle:hover {
  color: #ffff;
}

.arrow {
  font-size: 0.7rem;
  transition: transform 0.3s;
}

.arrow.open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: -10px;
  margin-top: 1.4rem; /* Añade un espacio entre el botón y el menú */
  background: rgba(255, 255, 255, 0.792);
  border-radius: 0.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 0rem 0;
  min-width: 110px;
  z-index: 200;
  background-color: rgba(41, 99, 179);

}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0rem;
  padding: 0.3rem 2rem;
  text-decoration: none;
  color: #362c42;
  transition: background 0.3s;
  border-radius: 0.5rem;
}

.dropdown-item:hover {
    background-color: rgb(28, 68, 123);
    border-radius: 0.5rem;


}

.icon {
  width: 60px;
  height: 20px;
}

</style>
