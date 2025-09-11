<template>
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
</template>

<style scoped>
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
@media (max-width: 700px) {
  .login-left {
    max-width: 100%;
    min-width: 0;
    padding: 2rem 1rem;
  }
}
</style>