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

instanciarMapa();

function instanciarMapa(){
    // Inicializar el mapa centrado en Xalapa
    const map = L.map('map', {
        center: [19.5333, -96.9167], 
        zoom: 30,
        zoomControl: false 
      });
    // Cargar tiles de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    // Ejemplo: marcador en el centro de Xalapa
    L.marker([19.5333, -96.9167])
    .addTo(map)
    .bindPopup("<b>Bienvenido a Xalapa</b><br>Aquí puedes mostrar rutas.")
    .openPopup();
}