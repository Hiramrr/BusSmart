// Selección de elementos
const sidebar = document.getElementById("sidebar");
const openSidebarBtn = document.getElementById("open-sidebar");
const closeSidebarBtn = document.getElementById("close-sidebar");
const origenInput = document.getElementById("origen-input");
const destinoInput = document.getElementById("destino-input");
const buscarRutaBtn = document.getElementById("btn-ruta");

// Inicializar el mapa centrado en Xalapa
const map = L.map("map", {
  center: [19.5333, -96.9167],
  zoom: 13,
  zoomControl: false,
});

// Inicializar el mapa
instanciarMapa();

// Abrir el menú lateral
openSidebarBtn.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

// Cerrar el menú lateral desde el icono de tache
closeSidebarBtn.addEventListener("click", () => {
  sidebar.classList.remove("active");
});

// Manejo de búsqueda de ruta
buscarRutaBtn.addEventListener("click", async () => {
  const origen = origenInput.value.trim();
  const destino = destinoInput.value.trim();

  if (origen && destino) {
    alert(`Calculando ruta desde "${origen}" hasta "${destino}" 🚍`);

    try {
      const coordsOrigen = await getCoordsBackend(origen);
      const coordsDestino = await getCoordsBackend(destino);

      trazarRutaBackend(coordsOrigen, coordsDestino, map);
    } catch (err) {
      console.error("Error al calcular ruta:", err);
      alert("No se pudo calcular la ruta. Revisa la consola.");
    }
  } else {
    alert("Por favor ingresa tanto el origen como el destino");
  }
});

// Lista de lugares de ejemplo
(async () => {
  const lugares = [
    "Parque Juárez Xalapa",
    "Catedral Metropolitana de Xalapa",
    "Parque de los Tecajetes",
    "Parque Los Berros",
    "Museo de Antropología de Xalapa",
    "Universidad Veracruzana Rectoría",
    "Paseo de los Lagos Xalapa",
    "Mercado Jáuregui Xalapa",
    "Parque Natura Xalapa",
    "Palacio de Gobierno de Veracruz en Xalapa",
    "Estadio Xalapeño Heriberto Jara Corona",
    "Avenida Ávila Camacho Xalapa",
    "Calle Enríquez Xalapa",
    "Hospital Civil Dr. Luis F. Nachón Xalapa",
    "Secretaría de Finanzas y Planeación Xalapa",
    "CAXA Terminal de Autobuses Xalapa",
    "Museo Interactivo de Xalapa",
    "Paseo de la Constitución Xalapa",
    "Plaza Crystal Xalapa",
    "Plaza Ánimas Xalapa"
  ];

  try {
    for (const lugar of lugares) {
      const coords = await getCoordsBackend(lugar);
      console.log(`${lugar} ➝ Lat: ${coords.lat}, Lng: ${coords.lng}`);
    }
  } catch (err) {
    console.error("Error en geocodificación:", err);
  }
})();

// Función para obtener coordenadas desde el backend
async function getCoordsBackend(lugar) {
  const url = `https://bussmart.onrender.com/geocode?text=${encodeURIComponent(lugar)}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.features && data.features.length > 0) {
    return {
      lat: data.features[0].geometry.coordinates[1],
      lng: data.features[0].geometry.coordinates[0],
    };
  }
  throw new Error("No se encontró " + lugar);
}

// Función para trazar ruta usando el backend
async function trazarRutaBackend(origen, destino, map) {
  const url = `https://bussmart.onrender.com/directions?startLng=${origen.lng}&startLat=${origen.lat}&endLng=${destino.lng}&endLat=${destino.lat}`;
  const res = await fetch(url);
  const data = await res.json();

  const coords = data.features[0].geometry.coordinates.map(c => [c[1], c[0]]);
  L.polyline(coords, { color: "red", weight: 4 }).addTo(map);
  map.fitBounds(L.polyline(coords).getBounds());
}

// Función para instanciar el mapa
function instanciarMapa() {
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  L.marker([19.5333, -96.9167])
    .addTo(map)
    .bindPopup("<b>Bienvenido a Xalapa</b><br>Aquí puedes mostrar rutas.")
    .openPopup();

  map.on("dblclick", function (e) {
    const { lat, lng } = e.latlng;
    console.log(`Coordenadas: ${lat}, ${lng}`);

    L.marker([lat, lng])
      .addTo(map)
      .bindPopup(`📍 Marcador en:<br>Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`)
      .openPopup();
  });
}
