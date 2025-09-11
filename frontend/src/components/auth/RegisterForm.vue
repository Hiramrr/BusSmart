<template>
  <div>
    <h2>Registro</h2>
    <form @submit.prevent="handleRegister">
      <div class="input-group">
        <label for="reg-username">Usuario</label>
        <input type="text" id="reg-username" v-model="regUser" required autocomplete="username">
      </div>
      <div class="input-group">
        <label for="reg-email">Correo electrónico</label>
        <input type="email" id="reg-email" v-model="regEmail" required autocomplete="email">
      </div>
      <div class="input-group">
        <label for="reg-password">Contraseña</label>
        <input type="password" id="reg-password" v-model="regPass" required autocomplete="new-password">
      </div>
      <button type="submit" class="btn-signin">Registrarme</button>
      <div class="input-row">
        <span>¿Ya tienes cuenta?</span>
        <a href="#" class="forgot" @click.prevent="$emit('switchToLogin')">Iniciar sesión</a>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Declara los eventos que este componente puede emitir.
defineEmits(['switchToLogin']);

// Estado local para los campos del formulario
const regUser = ref('');
const regEmail = ref('');
const regPass = ref('');

function handleRegister() {
  // Aquí irá la lógica de registro real
  alert(`Registrando a: ${regUser.value}, con email: ${regEmail.value}`);
}
</script>

<style scoped>
/* Los estilos son idénticos a LoginForm, por lo que los copiamos.
   En un proyecto más grande, podrías crear un componente base para los inputs
   o usar clases de CSS globales para evitar esta duplicación. */
h2 {
  margin-bottom: 1.5rem;
  color: #2963b3;
}
.input-group {
  margin-bottom: 1.2rem;
}
.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #213261;
}
.input-group input {
  width: 100%;
  padding: 0.5rem;
  border-radius: 0.4rem;
  border: 1px solid #ccc;
  font-size: 1rem;
}
.input-row {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.btn-signin {
  width: 100%;
  padding: 0.7rem;
  background: #2963b3;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
  margin-bottom: 0.7rem;
}
.btn-signin:hover {
  background: #213261;
}
.forgot {
  color: #a763ca;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.98rem;
}
</style>