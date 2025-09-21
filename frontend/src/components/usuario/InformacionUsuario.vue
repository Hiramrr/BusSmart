<template>
  <section>
    <h1>Informacion Usuario</h1>
    <img :src="user.profile.picture" alt="Foto de perfil del usuario" class="profile-picture" />
    <h2>Bienvenido {{ user.profile.name }}</h2>
    <p>Email: {{ user.profile.email }}</p>
  </section>
</template>

<script setup>
import { useAuth } from '@/componibles/useAuth.js'

const { user } = useAuth()
</script>

<style scoped>
section {
  padding: 5rem;
}

.profile-picture {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f0f0f0;
}
</style>
