<template>
  <n-config-provider :theme="isDarkTheme ? darkTheme : null">
    <main>
      <div class="theme-toggle-container">
        <n-button @click="toggleTheme">
          {{ isDarkTheme ? '☀️ Modo Claro' : '🌙 Modo Oscuro' }}
        </n-button>
      </div>
      <RouterView :is-dark-theme="isDarkTheme" />
    </main>
  </n-config-provider>
</template>

<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import { NConfigProvider, darkTheme, NButton } from 'naive-ui'

const isDarkTheme = ref(true)

const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value
}
</script>

<style scoped>
main {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.theme-toggle-container {
  position: absolute;
  top: 80px;
  right: 33px;
  z-index: 2000;
}
</style>