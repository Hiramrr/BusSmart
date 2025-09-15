import connectDB from "../config/mongo.js";
import { getStopCache } from "../cache.js"; //IMPORTA LA CACHÉ
import { getDistanceInMeters } from "../utils/geolocation.js"; //UTILIDAD DE DISTANCIA

export const getRuta = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectDB();

    const ruta = await db
      .collection("rutas")
      .findOne({ "features.properties.id": id });

    if (ruta) {
      res.json(ruta);
    } else {
      res.status(404).json({ message: "Ruta no encontrada" });
    }
  } catch (error) {
    console.error("Error al buscar ruta", error);
    res.status(500).json({ error: "No se encontró la ruta" });
  }
};

export const autocomplete = async (req, res) => {
  try {
    const query = req.query.query || "";
    if (!query) {
      return res.status(400).json({ error: "Se requiere el parámetro query" });
    }

    const db = await connectDB(); // 👈 conexión reutilizable
    const collection = db.collection("geocodificacion");

    const results = await collection
      .find(
        { nombre: { $regex: query, $options: "i" } },
        { projection: { nombre: 1, location: 1 } },
      )
      .limit(10)
      .toArray();

    // Imprimir coordenadas en consola
    results.forEach((r) => {
      if (r.location?.coordinates) {
        console.log(
          `Lugar: ${r.nombre}, Coordenadas: ${r.location.coordinates}`,
        );
      }
    });

    res.json(results);
  } catch (error) {
    console.error("Error en autocomplete:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

export const getAllRutas = async (req, res) => {
  try {
    const db = await connectDB();
    const options = {
      projection: {
        name: 1,
        desc: 1,
        notes: 1,
        id: 1,
        peak_am: 1,
        midday: 1,
        peak_pm: 10,
        night: 1,
      },
    };
    const rutas = await db.collection("rutas").find({}, options).toArray();
    res.json(rutas);
  } catch (error) {
    console.error("Error al obtener todas las rutas", error);
    res.status(500).json({ error: "Error al obtener las rutas" });
  }
};

export const sugerirRuta = async (req, res) => {
  const { latOrigen, lngOrigen, latDestino, lngDestino } = req.query;

  // 1. Validación de entrada
  if (!latOrigen || !lngOrigen || !latDestino || !lngDestino) {
    return res.status(400).json({ message: "Faltan coordenadas de origen o destino." });
  }

  const origen = { lat: parseFloat(latOrigen), lng: parseFloat(lngOrigen) };
  const destino = { lat: parseFloat(latDestino), lng: parseFloat(lngDestino) };
  const radioBusqueda = 400; // Radio en metros para buscar paradas cercanas

  try {
    const paradasCache = getStopCache();
    if (paradasCache.length === 0) {
      return res.status(500).json({ message: "El servidor aún no está listo, intente de nuevo." });
    }

    // 2. Buscar paradas cercanas (en memoria)
    const paradasCercanasOrigen = [];
    const paradasCercanasDestino = [];

    for (const parada of paradasCache) {
      const [lngParada, latParada] = parada.coordinates;

      const distOrigen = getDistanceInMeters(origen.lat, origen.lng, latParada, lngParada);
      if (distOrigen <= radioBusqueda) {
        paradasCercanasOrigen.push({ ...parada, distancia: distOrigen });
      }

      const distDestino = getDistanceInMeters(destino.lat, destino.lng, latParada, lngParada);
      if (distDestino <= radioBusqueda) {
        paradasCercanasDestino.push({ ...parada, distancia: distDestino });
      }
    }

    // 3. Encontrar Rutas Candidatas
    const rutasOrigen = new Set(paradasCercanasOrigen.map(p => p.routeId));
    const rutasDestino = new Set(paradasCercanasDestino.map(p => p.routeId));
    const rutasCandidatas = [...rutasOrigen].filter(id => rutasDestino.has(id));

    // 4. Validar y calificar cada ruta candidata
    const opcionesDeViaje = [];
    for (const routeId of rutasCandidatas) {
      const paradasDeRutaEnOrigen = paradasCercanasOrigen.filter(p => p.routeId === routeId);
      const paradasDeRutaEnDestino = paradasCercanasDestino.filter(p => p.routeId === routeId);

      // Encontrar la parada más cercana para subir y bajar de ESTA ruta
      const paradaSubidaOptima = paradasDeRutaEnOrigen.sort((a, b) => a.distancia - b.distancia)[0];
      const paradaBajadaOptima = paradasDeRutaEnDestino.sort((a, b) => a.distancia - b.distancia)[0];

      // Validar la dirección
      if (paradaSubidaOptima.sequence < paradaBajadaOptima.sequence) {
        opcionesDeViaje.push({
          routeId,
          paradaSubida: paradaSubidaOptima,
          paradaBajada: paradaBajadaOptima,
          distanciaTotalCaminando: paradaSubidaOptima.distancia + paradaBajadaOptima.distancia,
        });
      }
    }

    // 5. Ordenar resultados
    opcionesDeViaje.sort((a, b) => a.distanciaTotalCaminando - b.distanciaTotalCaminando);
    
    // (Opcional) Enriquecer con el nombre de la ruta
    const db = await connectDB();
    const rutasInfo = await db.collection("rutas").find({ "features.properties.id": { $in: opcionesDeViaje.map(o => o.routeId) } }).toArray();
    
    const respuestaFinal = opcionesDeViaje.map(opcion => {
        const info = rutasInfo.find(r => r.features[0].properties.id === opcion.routeId);
        return {
            ...opcion,
            nombreRuta: info ? info.features[0].properties.name : "Nombre no encontrado",
            descripcionRuta: info ? info.features[0].properties.desc : ""
        }
    });


    res.json(respuestaFinal.slice(0, 5)); // Devolver las 5 mejores opciones

  } catch (error) {
    console.error("Error al sugerir la ruta:", error);
    res.status(500).json({ message: "Error interno del servidor al procesar la solicitud." });
  }
};