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
}
</style>