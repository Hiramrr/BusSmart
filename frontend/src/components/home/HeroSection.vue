<template>
  <section id="hero">
    <div class="hero-content">
      <h1 class="autoBlur">Encuentra tu ruta de camión fácilmente con <span>BusSmart</span></h1>
      <p class="autoBlur">
        La forma más rápida y sencilla de moverte por Xalapa en transporte público.
      </p>
      <router-link to="/MapView" class="map-btn">Ver rutas</router-link>
    </div>
  </section>
</template>
<script></script>
<style scoped>
#hero {
  height: 100vh; /* ocupa toda la pantalla */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 2rem;
  background: radial-gradient(circle at center, #000000 10%, #090a0b 30%, #213261 100%);
  color: #ffffff;
  position: relative;
}

/* Ajuste del texto para que no se oculte bajo la navbar */
#hero h1 {
  margin-top: 4rem; /* separa el título de la navbar */
}

/* Botón principal */

.hero-content p {
  margin-bottom: 1.5rem; /* le da espacio debajo del párrafo */
}

.hero-content .map-btn {
  display: inline-block;
}
.map-btn {
  padding: 0.75rem 1.5rem;
  background-color: #2963b3;
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: background-color 0.3s;
  border: 2px solid #2963b3;
}

.map-btn:hover {
  background-color: rgb(213, 213, 213);
  border: 2px solid #213261;
  color: #213261;
}
</style>
