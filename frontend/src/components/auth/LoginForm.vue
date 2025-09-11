<template>
  <div>
    <h2>Iniciar Sesión</h2>
    <form @submit.prevent="handleLogin">
      <div class="input-group">
        <label for="username">Usuario</label>
        <input type="text" id="username" v-model="loginUser" required autocomplete="username">
      </div>
      <div class="input-group">
        <label for="password">Contraseña</label>
        <input type="password" id="password" v-model="loginPass" required autocomplete="current-password">
      </div>
      <div class="input-row">
        <label class="remember-me"><input type="checkbox" v-model="remember"> Remember Me</label>
      </div>
      <button type="submit" class="btn-signin">Ingresar</button>
      <div class="input-row">
        <span>¿No tienes cuenta?</span>
        <a href="#" class="forgot" @click.prevent="$emit('switchToRegister')">Registrarme</a>
      </div>
      <div class="login-terms">
        Al hacer clic en "Ingresar" aceptas los <a href="#">Términos de servicio</a> | <a href="#">Política de privacidad</a>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Declara los eventos que este componente puede emitir.
defineEmits(['switchToRegister']);

// Estado local para los campos del formulario
const loginUser = ref('');
const loginPass = ref('');
const remember = ref(false);

function handleLogin() {
  // Aquí irá la lógica de autenticación real
  alert(`Iniciando sesión con: ${loginUser.value}`);
}
</script>

<style scoped>
/* Copiamos y pegamos solo los estilos relevantes para este formulario */
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
.remember-me {
  font-size: 0.95rem;
  color: #666;
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
.login-terms {
  font-size: 0.85rem;
  color: #888;
  margin-top: 1.2rem;
}
</style>