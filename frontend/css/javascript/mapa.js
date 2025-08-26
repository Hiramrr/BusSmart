// Selección de elementos
const sidebar = document.getElementById("sidebar");
const openSidebarBtn = document.getElementById("open-sidebar");
const closeSidebarBtn = document.getElementById("close-sidebar");
const searchBar = document.getElementById("search-bar");

// Abrir el menú lateral
openSidebarBtn.addEventListener("click", () => {
  sidebar.classList.add("active");
});

// Cerrar el menú lateral
closeSidebarBtn.addEventListener("click", () => {
  sidebar.classList.remove("active");
});

// Manejo de búsqueda (ejemplo básico)
searchBar.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const query = searchBar.value.trim();
    if (query) {
      alert(`Buscando la ruta: ${query}`);
      // Aquí en el futuro puedes llamar a tu API o filtrar rutas en el mapa
    }
  }
});
