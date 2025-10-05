<template>
  <div class="user-view">
    <TheHeader />
    <main class="main-content">
      <InformacionUsuario />
    </main>
    <TheFooter />
  </div>
</template>

<script setup>
import TheHeader from '@/components/layout/TheHeader.vue'
import TheFooter from '@/components/layout/TheFooter.vue'
import InformacionUsuario from '@/components/usuario/InformacionUsuario.vue'
</script>

<style scoped>
.user-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding-top: 66px;
}
</style>
