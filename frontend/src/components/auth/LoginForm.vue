<template>
  <div>
    <h2>Iniciar Sesión</h2>
    <div>
      <p class="info-text">
        Serás redirigido a nuestra página segura para iniciar sesión o crear una cuenta.
      </p>
      <button @click="$auth.login()" class="btn-signin">Ingresar o Registrarme</button>
      <div class="login-terms">
        Al continuar, aceptas nuestros <a href="#">Términos de servicio</a>.
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.info-text {
  margin-bottom: 1.5rem;
  color: #555;
  text-align: center;
}
h2 {
  margin-bottom: 1.5rem;
  color: #2963b3;
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
.login-terms {
  font-size: 0.85rem;
  color: #888;
  margin-top: 1.2rem;
  text-align: center;
}
</style>
