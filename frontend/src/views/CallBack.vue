<template>
  <div>Procesando inicio de sesión...</div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuth } from '../componibles/useAuth.js'

const { handleLoginCallback } = useAuth()

onMounted(() => {
  console.log('CALLBACK: Componente Callback.vue montado. Llamando a handleLoginCallback...')
  handleLoginCallback()
})
</script>
