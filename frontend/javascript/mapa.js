//Se crea el mapa para luego llamarse desde UI 
export const map = L.map("map", {
  center: [19.5333, -96.9167],
  zoom: 13,
  zoomControl: false,
});

export function instanciarMapa() {
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  L.marker([19.5333, -96.9167])
    .addTo(map)
    .bindPopup("<b>Bienvenido a Xalapa</b><br>Aquí puedes mostrar rutas.")
    .openPopup();

  map.on("dblclick", function (e) {
    const { lat, lng } = e.latlng;
    L.marker([lat, lng])
      .addTo(map)
      .bindPopup(`📍 Marcador en:<br>Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`)
      .openPopup();
  });
}
