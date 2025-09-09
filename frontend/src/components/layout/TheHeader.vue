<template>
  <header>
    <nav>
        <div class="logo">BusSmart</div>
        <ul class="nav-links">
        <li><a href="#features">Características</a></li>
        <li><a href="pages/mapa.html">Mapa</a></li>
        <li><a href="#descargar">Descargar</a></li>
        <li><a href="#contacto">Contacto</a></li>
        </ul>
    </nav>
  </header>
</template>

<script>

</script>

<style scoped>
    header {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        background-color: rgba(0, 0, 0, 0.70);
        backdrop-filter: blur(10px);
        padding: 1rem 2rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        z-index: 100;
    }

    nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .logo {
        font-weight: 700;
        font-size: 1.5rem;
        color: #2963b3;
    }
    
    .nav-links {
        list-style: none;
        display: flex;
        gap: 1.5rem;
    }
    
    .nav-links a {
        text-decoration: none;
        color: #2963b3;
        font-weight: 500;
        transition: color 0.3s;
    }
    
    .nav-links a:hover {
        color: #fdfaff;
    }
</style>