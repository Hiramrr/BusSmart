<template>
  <section id="hero">
    <div class="hero-content">
      <img src="@/assets/Imagenes/LogoBusSmart.png" alt="Logo de BusSmart" class="hero-logo" />

      <h1 class="autoBlur">Encuentra tu ruta de camión fácilmente con <span>BusSmart</span></h1>
      <p class="autoBlur">
        La forma más rápida y sencilla de moverte por Xalapa en transporte público.
      </p>
      <router-link to="/map" class="map-btn">Ver rutas</router-link>
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
  margin-top: 0rem; /* separa el título de la navbar */
}

.hero-logo {
  height: 130px; /* Ajusta la altura del logo como prefieras */
  width: auto; /* Mantiene la proporción original de la imagen */
  margin-bottom: 0rem; /* Crea un espacio entre el logo y el texto de abajo */
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

/* ========== ESTILOS MÓVIL ========== */
@media (max-width: 768px) {
  #hero h1 {
    font-size: 1.8rem; /* Hacemos el título más pequeño en pantallas chicas */
  }
  .hero-logo {
    height: 100px; /* También podemos ajustar el logo */
  }
}
</style>
