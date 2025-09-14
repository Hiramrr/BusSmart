<template>
  <!-- Barra superior con botón menú y búsqueda -->
  <header class="topbar">
    <button @click="openSidebar">☰</button>                 
    <!-- Botón para calcular ruta -->
    <button @click="buscarRuta">🚍 Buscar Ruta</button>
  </header>
</template>

<script>
export default {
  name: "Topbar", // nombre del componente
  methods: {
    openSidebar() {
      // aquí pones lo que quieras que haga el botón
      console.log("Sidebar abierto");
    },
    buscarRuta() {
      // lógica para calcular la ruta
      console.log("Buscando ruta...");
    }
  }
};
</script>

<style scoped>
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1976d2;
  color: white;
  padding: 10px;
}

.topbar button {
  background: white;
  color: #1976d2;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
}

.topbar button:hover {
  background: #f0f0f0;
}
</style>
