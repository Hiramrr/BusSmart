// ui.js
import { map, instanciarMapa, dibujarRuta } from "./mapa.js";
import { getCoords, trazarRuta, fetchAutocomplete } from "./api.js";
import { debounce } from "./utils.js";

// -------------------- Selección de elementos --------------------
const sidebar = document.getElementById("sidebar");
const openSidebarBtn = document.getElementById("open-sidebar");
const closeSidebarBtn = document.getElementById("close-sidebar");
const buscarRutaBtn = document.getElementById("btn-ruta");

// -------------------- Inicialización del mapa --------------------
instanciarMapa();

// -------------------- Sidebar --------------------
openSidebarBtn.addEventListener("click", () => sidebar.classList.toggle("active"));
closeSidebarBtn.addEventListener("click", () => sidebar.classList.remove("active"));

// -------------------- Función genérica de autocompletado --------------------
function setupAutocomplete(inputId, suggestionsId) {
  const input = document.getElementById(inputId);
  const suggestions = document.getElementById(suggestionsId);

  const mostrarSugerencias = (lugares) => {
    suggestions.innerHTML = "";
    if (lugares.length === 0) {
      suggestions.style.display = "none";
      return;
    }

    lugares.forEach(lugar => {
      const li = document.createElement("li");
      li.textContent = lugar.nombre;
      li.addEventListener("click", () => {
        input.value = lugar.nombre;
        suggestions.style.display = "none";
        // Guardamos coordenadas seleccionadas para uso posterior
        console.log(`Coordenadas seleccionadas para ${inputId}:`, lugar.location.coordinates);
      });
      suggestions.appendChild(li);
    });

    suggestions.style.display = "block";
  };

  const handleInput = debounce(async () => {
    const query = input.value.trim();
    if (!query) {
      suggestions.style.display = "none";
      return;
    }

    const lugares = await fetchAutocomplete(query);
    mostrarSugerencias(lugares);
  }, 300); // espera 300ms entre peticiones

  input.addEventListener("input", handleInput);
}

// -------------------- Configuración de autocompletado para ambos inputs --------------------
setupAutocomplete("origen-input", "origen-suggestions");
setupAutocomplete("destino-input", "destino-suggestions");

// -------------------- Buscar ruta (prueba con ID) --------------------
buscarRutaBtn.addEventListener("click", buscarRutaPrueba);

async function buscarRutaPrueba() {
  const routeId = document.getElementById("destino-input").value.trim();
  if (!routeId) {
    alert("Por el momento solo se puede buscar por id jaja.");
    return;
  }

  const apiUrl = `https://bussmart.onrender.com/api/rutas/${routeId}`;
  try {
    console.log(`Pidiendo datos a: ${apiUrl}`);
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`La ruta con ID "${routeId}" no fue encontrada.`);

    const geojsonData = await response.json();
    dibujarRuta(geojsonData, map);
  } catch (error) {
    console.error("Error en la búsqueda:", error);
    alert(error.message);
  }
}
