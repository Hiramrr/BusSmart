<template>
  <div class="callback-container">
    <p>Procesando inicio de sesión, por favor espera...</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuth } from '../componibles/useAuth.js'

const { handleLoginCallback } = useAuth()

onMounted(() => {
  handleLoginCallback()
})
</script>
