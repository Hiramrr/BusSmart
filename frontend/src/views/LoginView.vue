<template>
  <div class="login-main-bg"></div>
  <div class="login-overlay"></div>
  <div class="login-wrapper">

    <AuthBranding />

    <div class="login-right">

      <LoginForm 
        v-if="!showRegister" 
        @switchToRegister="showRegister = true" 
      />
      <RegisterForm 
        v-else 
        @switchToLogin="showRegister = false" 
      />
      
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 1. Importamos los componentes hijos que vamos a orquestar.
import AuthBranding from '@/components/auth/AuthBranding.vue';
import LoginForm from '@/components/auth/LoginForm.vue';
import RegisterForm from '@/components/auth/RegisterForm.vue';

// 2. Este es el único estado que la vista necesita manejar:
// si se debe mostrar el formulario de registro o no.
const showRegister = ref(false);
</script>

<style scoped>
/* En la vista principal, solo mantenemos los estilos que definen
  el layout y la estructura general. Los estilos específicos de los
  formularios o del panel de bienvenida ya están en sus propios
  componentes.
*/
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
.login-right {
  flex: 1;
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
@media (max-width: 700px) {
  .login-wrapper {
    flex-direction: column;
    margin: 2rem 1rem;
  }
  .login-right {
    padding: 2rem 1rem;
  }
}
</style>