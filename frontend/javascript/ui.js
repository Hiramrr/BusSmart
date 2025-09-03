// ui.js
import { map, instanciarMapa } from "./mapa.js";
import { getCoords, trazarRuta } from "./api.js";

// Selección de elementos
const sidebar = document.getElementById("sidebar");
const openSidebarBtn = document.getElementById("open-sidebar");
const closeSidebarBtn = document.getElementById("close-sidebar");
const origenInput = document.getElementById("origen-input");
const destinoInput = document.getElementById("destino-input");
const buscarRutaBtn = document.getElementById("btn-ruta");

instanciarMapa();

// Sidebar
openSidebarBtn.addEventListener("click", () => sidebar.classList.toggle("active"));
closeSidebarBtn.addEventListener("click", () => sidebar.classList.remove("active"));

// Buscar ruta
buscarRutaBtn.addEventListener("click", async () => {
  const origen = origenInput.value.trim();
  const destino = destinoInput.value.trim();

  if (!origen || !destino) return alert("Ingresa origen y destino");

  try {
    const coordsOrigen = await getCoords(origen);
    const coordsDestino = await getCoords(destino);
    trazarRuta(coordsOrigen, coordsDestino, map);
  } catch (err) {
    console.error(err);
    alert("No se pudo calcular la ruta");
  }
});

 // Lugares de ejemplo para pruebas
import { lugaresEjemplo } from "./data.js";

 (async () => {
   for (const lugar of lugaresEjemplo) {
     try {
       const coords = await getCoords(lugar);
       console.log(`${lugar} ➝ Lat: ${coords.lat}, Lng: ${coords.lng}`);
     } catch (err) {
       console.error(`Error en ${lugar}:`, err);
     }
   }
 })();
