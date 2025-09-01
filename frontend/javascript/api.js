// api.js
//En este archivo se consume nuestra api de backend
const API_BASE = "https://bussmart.onrender.com/api/ors"; //llamada a nuestra propia api


export async function getCoords(lugar) { //
  const url = `${API_BASE}/geocode?text=${encodeURIComponent(lugar)}`;
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

export async function trazarRuta(origen, destino, map) {
  const url = `${API_BASE}/directions?startLng=${origen.lng}&startLat=${origen.lat}&endLng=${destino.lng}&endLat=${destino.lat}`;
  const res = await fetch(url);
  const data = await res.json();

  const coords = data.features[0].geometry.coordinates.map(c => [c[1], c[0]]);
  L.polyline(coords, { color: "red", weight: 4 }).addTo(map);
  map.fitBounds(L.polyline(coords).getBounds());
}
