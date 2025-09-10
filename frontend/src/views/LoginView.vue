<template>
  <div class="login-main-bg"></div>
  <div class="login-overlay"></div>
  <div class="login-wrapper">
    <div class="login-left">
      <h1>Bienvenido<br>A BusSmart</h1>
      <p>Llega a tu destino sin problemas</p>
      <div class="login-socials">
        <a href="#" title="Facebook"><img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/facebook.svg" alt="Facebook"></a>
        <a href="#" title="Twitter"><img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/twitter.svg" alt="Twitter"></a>
        <a href="#" title="Instagram"><img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/instagram.svg" alt="Instagram"></a>
        <a href="#" title="YouTube"><img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/youtube.svg" alt="YouTube"></a>
      </div>
    </div>
    <div class="login-right">
      <h2 v-show="!showRegister">Iniciar Sesión</h2>
      <h2 v-show="showRegister">Registro</h2>
      <form v-show="!showRegister" @submit.prevent="handleLogin">
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
          <a href="#" class="forgot" @click.prevent="showRegister = true">Registrarme</a>
        </div>
        <div class="login-terms">
          Al hacer clic en "Ingresar" aceptas los <a href="#">Términos de servicio</a> | <a href="#">Política de privacidad</a>
        </div>
      </form>
      <form v-show="showRegister" @submit.prevent="handleRegister">
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
          <a href="#" class="forgot" @click.prevent="showRegister = false">Iniciar sesión</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const showRegister = ref(false);
const loginUser = ref('');
const loginPass = ref('');
const remember = ref(false);
const regUser = ref('');
const regEmail = ref('');
const regPass = ref('');

function handleLogin() {
  // Aquí va la lógica de autenticación
  alert(`Login: ${loginUser.value}`);
}
function handleRegister() {
  // Aquí va la lógica de registro
  alert(`Registro: ${regUser.value}, ${regEmail.value}`);
}
</script>

<style scoped>
.login-main-bg {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: linear-gradient(120deg, #2963b3 0%, #a763ca 100%);
  z-index: 0;
}
.login-overlay {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(255,255,255,0.7);
  z-index: 1;
}
.login-wrapper {
  position: relative;
  z-index: 2;
  display: flex;
  max-width: 800px;
  margin: 4rem auto;
  background: #fff;
  border-radius: 1.5rem;
  box-shadow: 0 2px 24px rgba(41,99,179,0.12);
  overflow: hidden;
}
.login-left {
  background: #2963b3;
  color: #fff;
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-width: 220px;
  max-width: 300px;
}
.login-left h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
}
.login-left p {
  margin-bottom: 2rem;
}
.login-socials a {
  display: inline-block;
  margin-right: 0.7rem;
  margin-bottom: 0.5rem;
}
.login-socials img {
  width: 28px;
  height: 28px;
  filter: invert(1);
}
.login-right {
  flex: 1;
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.login-right h2 {
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
@media (max-width: 700px) {
  .login-wrapper {
    flex-direction: column;
    margin: 2rem 1rem;
  }
  .login-left, .login-right {
    max-width: 100%;
    min-width: 0;
    padding: 2rem 1rem;
  }
}
</style>
