import mongoose from "mongoose";
import connectDB from "../config/mongo.js";
import { getStopCache, getRoutesCache, initializeCaches } from "../cache.js";
import { getDistanceInMeters } from "../utils/geolocation.js";
import Ruta from '../models/ruta.model.js';
import Parada from '../models/parada.model.js';

// --- CONTROLADORES EXISTENTES (LIGERAMENTE AJUSTADOS PARA USAR MODELOS) ---

export const getRuta = async (req, res) => {
  try {
    const { id } = req.params;
    // Usando el modelo de Mongoose, que es más limpio y seguro
    const ruta = await Ruta.findOne({ "features.properties.id": id });

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

export const getAllRutas = (req, res) => {
  try {
    const rutas = getRoutesCache();
    if (rutas.length === 0) {
      return res.status(503).json({
        error:
          "El servicio no está disponible, por favor intente de nuevo en un momento.",
      });
    }
    res.json(rutas);
  } catch (error) {
    console.error("Error en getAllRutas:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

export const sugerirRuta = async (req, res) => {
  const { latOrigen, lngOrigen, latDestino, lngDestino } = req.query;

  if (!latOrigen || !lngOrigen || !latDestino || !lngDestino) {
    return res
      .status(400)
      .json({ message: "Faltan coordenadas de origen o destino." });
  }

  const origen = { lat: parseFloat(latOrigen), lng: parseFloat(lngOrigen) };
  const destino = { lat: parseFloat(latDestino), lng: parseFloat(lngDestino) };
  const radioBusqueda = 800;

  try {
    const paradasCache = getStopCache();
    if (!paradasCache || paradasCache.length === 0) {
      return res
        .status(503)
        .json({ message: "El servidor aún no está listo, intente de nuevo." });
    }

    const paradasCercanasOrigen = [];
    const paradasCercanasDestino = [];

    for (const parada of paradasCache) {
      if (
        parada.coordinates &&
        Array.isArray(parada.coordinates) &&
        parada.coordinates.length === 2
      ) {
        const [lngParada, latParada] = parada.coordinates;

        const distOrigen = getDistanceInMeters(
          origen.lat,
          origen.lng,
          latParada,
          lngParada
        );
        if (distOrigen <= radioBusqueda) {
          paradasCercanasOrigen.push({ ...parada, distancia: distOrigen });
        }

        const distDestino = getDistanceInMeters(
          destino.lat,
          destino.lng,
          latParada,
          lngParada
        );
        if (distDestino <= radioBusqueda) {
          paradasCercanasDestino.push({ ...parada, distancia: distDestino });
        }
      }
    }

    const rutasOrigen = new Set(paradasCercanasOrigen.map((p) => p.routeId));
    const rutasDestino = new Set(paradasCercanasDestino.map((p) => p.routeId));
    const rutasCandidatas = [...rutasOrigen].filter((id) =>
      rutasDestino.has(id)
    );

    const opcionesDeViaje = [];
    for (const routeId of rutasCandidatas) {
      const paradasDeRutaEnOrigen = paradasCercanasOrigen.filter(
        (p) => p.routeId === routeId
      );
      const paradasDeRutaEnDestino = paradasCercanasDestino.filter(
        (p) => p.routeId === routeId
      );

      const paradaSubidaOptima = paradasDeRutaEnOrigen.sort(
        (a, b) => a.distancia - b.distancia
      )[0];
      const paradaBajadaOptima = paradasDeRutaEnDestino.sort(
        (a, b) => a.distancia - b.distancia
      )[0];

      if (
        paradaSubidaOptima &&
        paradaBajadaOptima &&
        paradaSubidaOptima.sequence < paradaBajadaOptima.sequence
      ) {
        opcionesDeViaje.push({
          routeId,
          paradaSubida: paradaSubidaOptima,
          paradaBajada: paradaBajadaOptima,
          distanciaTotalCaminando:
            paradaSubidaOptima.distancia + paradaBajadaOptima.distancia,
        });
      }
    }

    opcionesDeViaje.sort(
      (a, b) => a.distanciaTotalCaminando - b.distanciaTotalCaminando
    );

    const rutasInfo = await Ruta.find({
      "features.properties.id": {
        $in: opcionesDeViaje.map((o) => o.routeId),
      },
    });

    const respuestaFinal = opcionesDeViaje.map((opcion) => {
      const info = rutasInfo.find(
        (r) => r.features[0]?.properties.id === opcion.routeId
      );
      return {
        ...opcion,
        nombreRuta: info
          ? info.features[0]?.properties.name
          : "Nombre no encontrado",
        descripcionRuta: info ? info.features[0]?.properties.desc : "",
      };
    });

    res.json(respuestaFinal.slice(0, 5));
  } catch (error) {
    console.error("Error al sugerir la ruta:", error);
    res.status(500).json({
      message: "Error interno del servidor al procesar la solicitud.",
    });
  }
};

export const autocomplete = async (req, res) => {
  try {
    const query = req.query.query || "";
    if (!query) {
      return res.status(400).json({ error: "Se requiere el parámetro query" });
    }
    const db = await connectDB();
    const collection = db.collection("geocodificacion");
    const results = await collection
      .find(
        { nombre: { $regex: query, $options: "i" } },
        { projection: { nombre: 1, location: 1 } }
      )
      .limit(10)
      .toArray();
    res.json(results);
  } catch (error) {
    console.error("Error en autocomplete:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};


// --- NUEVO CONTROLADOR PARA CREAR RUTAS (ADMIN) ---

export const crearRuta = async (req, res) => {
  const { rutaData, paradasData } = req.body;

  // 1. Validación de entrada
  if (!rutaData || !paradasData) {
    return res.status(400).json({
      message: "Se requiere tanto la información de la ruta (rutaData) como de las paradas (paradasData).",
    });
  }

  // 2. Iniciar una transacción para asegurar la integridad de los datos
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 3. Crear y guardar el documento de la Ruta
    const nuevaRuta = new Ruta(rutaData);
    const rutaGuardada = await nuevaRuta.save({ session });

    // 4. Vincular las paradas a la ruta y guardarlas
    paradasData.ruta = rutaGuardada.ruta; // Vincula usando el identificador 'ruta'
    const nuevasParadas = new Parada(paradasData);
    await nuevasParadas.save({ session });

    // 5. Si todo fue bien, confirmar la transacción
    await session.commitTransaction();

    // 6. Refrescar la caché para que los cambios sean visibles inmediatamente
    console.log("Ruta creada. Refrescando la caché...");
    await initializeCaches();
    console.log("Caché refrescada exitosamente.");

    // 7. Enviar respuesta de éxito
    res.status(201).json({
      message: "Ruta y paradas creadas exitosamente.",
      ruta: rutaGuardada,
    });
  } catch (error) {
    // 8. Si algo falla, revertir todos los cambios
    await session.abortTransaction();
    console.error("Error en la transacción al crear la ruta:", error);

    // Manejo de errores específicos
    if (error.code === 11000) { // Error de clave duplicada
      return res.status(409).json({
        message: `El identificador de ruta '${rutaData.ruta}' ya existe.`,
      });
    }

    if (error.name === 'ValidationError') { // Error de validación del esquema Mongoose
      return res.status(400).json({ message: "Datos inválidos.", error: error.message });
    }

    // Error genérico del servidor
    res.status(500).json({ message: "Error interno del servidor al crear la ruta." });
  } finally {
    // 9. Siempre cerrar la sesión
    session.endSession();
  }
};