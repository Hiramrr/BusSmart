// ui.js
import { map, instanciarMapa, dibujarRuta } from "./mapa.js";
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
openSidebarBtn.addEventListener("click", () =>
  sidebar.classList.toggle("active"),
);
closeSidebarBtn.addEventListener("click", () =>
  sidebar.classList.remove("active"),
);

// Buscar ruta
/*buscarRutaBtn.addEventListener("click", async () => {
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
*/ //Comente esta funcion solo para hacer la prueba de solicitar el geojson a mongo, despues ya la implementare mejor jaja

buscarRutaBtn.addEventListener("click", buscarRutaPrueba);

async function buscarRutaPrueba() {
  const routeId = destinoInput.value.trim();
  if (!routeId) {
    alert("Por el momento solo se puede buscar por id jaja.");
    return;
  }
  const apiUrl = `https://bussmart.onrender.com/api/rutas/${routeId}`;
  try {
    console.log(`Pidiendo datos a: ${apiUrl}`);
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`La ruta con ID "${routeId}" no fue encontrada.`);
    }

    const geojsonData = await response.json();
    dibujarRuta(geojsonData, map);
  } catch (error) {
    console.error("Error en la búsqueda:", error);
    alert(error.message);
  }
}

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
