import mongoose from "mongoose";
import connectDB from "../config/mongo.js";
import { getStopCache, getRoutesCache, initializeCaches } from "../cache.js";
import { getDistanceInMeters } from "../utils/geolocation.js";
import { connectMongoose } from "../config/mongo.js";
import Ruta from "../models/ruta.model.js";
import Parada from "../models/parada.model.js";

export const getRuta = async (req, res) => {
  try {
    await connectMongoose(); // Conexión Mongoose
    const db = mongoose.connection.useDb("xalapa_rutas");
    const RutaModel = db.model("Ruta", Ruta.schema);

    const { id } = req.params;
    const ruta = await RutaModel.findOne({ "features.properties.id": id });

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
  // ... (Este método usa caché, no necesita cambios)
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
    await connectMongoose(); // <-- ARREGLO: Añadimos la conexión Mongoose
    const db = mongoose.connection.useDb("xalapa_rutas");
    const RutaModel = db.model("Ruta", Ruta.schema);

    const paradasCache = getStopCache();
    if (!paradasCache || paradasCache.length === 0) {
      return res
        .status(503)
        .json({ message: "El servidor aún no está listo, intente de nuevo." });
    }

    // ... (la lógica de búsqueda de paradas cercanas no cambia)
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
          lngParada,
        );
        if (distOrigen <= radioBusqueda) {
          paradasCercanasOrigen.push({ ...parada, distancia: distOrigen });
        }
        const distDestino = getDistanceInMeters(
          destino.lat,
          destino.lng,
          latParada,
          lngParada,
        );
        if (distDestino <= radioBusqueda) {
          paradasCercanasDestino.push({ ...parada, distancia: distDestino });
        }
      }
    }
    const rutasOrigen = new Set(paradasCercanasOrigen.map((p) => p.routeId));
    const rutasDestino = new Set(paradasCercanasDestino.map((p) => p.routeId));
    const rutasCandidatas = [...rutasOrigen].filter((id) =>
      rutasDestino.has(id),
    );
    const opcionesDeViaje = [];
    for (const routeId of rutasCandidatas) {
      const paradasDeRutaEnOrigen = paradasCercanasOrigen.filter(
        (p) => p.routeId === routeId,
      );
      const paradasDeRutaEnDestino = paradasCercanasDestino.filter(
        (p) => p.routeId === routeId,
      );
      const paradaSubidaOptima = paradasDeRutaEnOrigen.sort(
        (a, b) => a.distancia - b.distancia,
      )[0];
      const paradaBajadaOptima = paradasDeRutaEnDestino.sort(
        (a, b) => a.distancia - b.distancia,
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
      (a, b) => a.distanciaTotalCaminando - b.distanciaTotalCaminando,
    );

    // <-- ARREGLO: Usamos el modelo de Mongoose conectado
    const rutasInfo = await RutaModel.find({
      "features.properties.id": {
        $in: opcionesDeViaje.map((o) => o.routeId),
      },
    });

    const respuestaFinal = opcionesDeViaje.map((opcion) => {
      const info = rutasInfo.find(
        (r) => r.features[0]?.properties.id === opcion.routeId,
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
    // Este método usa el driver nativo, lo mantenemos así por ahora.
    const db = await connectDB();
    const collection = db.collection("geocodificacion");
    const results = await collection
      .find(
        { nombre: { $regex: query, $options: "i" } },
        { projection: { nombre: 1, location: 1 } },
      )
      .limit(10)
      .toArray();
    res.json(results);
  } catch (error) {
    console.error("Error en autocomplete:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

export const crearRuta = async (req, res) => {
  try {
    // <-- El try principal
    // --- LÍNEA AÑADIDA ---
    // Aseguramos la conexión con Mongoose antes de hacer cualquier otra cosa.
    await connectMongoose();

    const { rutaGeoJSON, paradasGeoJSON } = req.body;

    // --- 1. Validación Inicial Robusta ---
    if (!rutaGeoJSON || !paradasGeoJSON) {
      return res.status(400).json({
        message: "Se requieren los datos geojson de la ruta y las paradas.",
      });
    }

    if (
      rutaGeoJSON.type !== "FeatureCollection" ||
      paradasGeoJSON.type !== "FeatureCollection"
    ) {
      return res.status(400).json({
        message:
          "Los datos proporcionados no tienen el formato GeoJSON FeatureCollection válido.",
      });
    }

    const db = mongoose.connection.useDb("xalapa_rutas");
    const RutaModel = db.model("Ruta", Ruta.schema);
    const ParadaModel = db.model("Parada", Parada.schema);

    const rutaIdentifier = rutaGeoJSON.ruta;
    if (!rutaIdentifier) {
      return res.status(400).json({
        message:
          "El campo 'ruta' (identificador) es obligatorio en el GeoJSON de la ruta.",
      });
    }

    // --- 2. Transacción Atómica ---
    const session = await db.startSession();
    try {
      session.startTransaction();

      const nuevaRuta = new RutaModel(rutaGeoJSON);
      const rutaGuardada = await nuevaRuta.save({ session });

      paradasGeoJSON.ruta = rutaIdentifier;
      const nuevasParadas = new ParadaModel(paradasGeoJSON);
      await nuevasParadas.save({ session });

      await session.commitTransaction();

      console.log(`Ruta '${rutaIdentifier}' creada. Refrescando la caché...`);
      await initializeCaches();
      console.log("Caché refrescada exitosamente.");

      res.status(201).json({
        message: "Ruta y paradas creadas exitosamente.",
        ruta: rutaGuardada,
      });
    } catch (error) {
      await session.abortTransaction();
      console.error("Error en la transacción al crear la ruta:", error);

      if (error.code === 11000) {
        return res.status(409).json({
          message: `El identificador de ruta '${rutaIdentifier}' ya existe. Por favor, elige otro.`,
        });
      }
      if (error.name === "ValidationError") {
        return res.status(400).json({
          message: "Los datos proporcionados son inválidos.",
          error: error.message,
        });
      }

      res
        .status(500)
        .json({ message: "Error interno del servidor al crear la ruta." });
    } finally {
      session.endSession();
    }
  } catch (dbError) {
    // Este catch ahora atrapará el error si connectMongoose falla.
    console.error("Error de conexión con la base de datos:", dbError);
    res.status(500).json({
      message: "No se pudo establecer la conexión con la base de datos.",
    });
  }
};

export const eliminarRuta = async (req, res) => {
  try {
    await connectMongoose();

    // 1. Obtenemos el _id de MongoDB desde los parámetros de la URL.
    const { id: routeMongoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(routeMongoId)) {
      return res
        .status(400)
        .json({ message: "El ID proporcionado no es válido." });
    }

    const db = mongoose.connection.useDb("xalapa_rutas");
    const RutaModel = db.model("Ruta", Ruta.schema);
    const ParadaModel = db.model("Parada", Parada.schema);

    // 2. Buscamos la ruta primero para obtener su identificador textual (campo 'ruta').
    const rutaParaEliminar = await RutaModel.findById(routeMongoId);

    if (!rutaParaEliminar) {
      return res.status(404).json({
        message: `La ruta con ID '${routeMongoId}' no fue encontrada.`,
      });
    }

    // Este es el identificador que relaciona Ruta y Parada, ej: "vuelta" o "PRUEBA-01".
    const rutaIdentifier = rutaParaEliminar.ruta;

    // 3. Iniciamos una transacción para una eliminación atómica.
    const session = await db.startSession();
    session.startTransaction();

    try {
      // 4. Eliminamos la ruta por su _id.
      await RutaModel.findByIdAndDelete(routeMongoId, { session });

      // 5. Eliminamos el documento de paradas usando el identificador textual.
      await ParadaModel.deleteOne({ ruta: rutaIdentifier }).session(session);

      // Si todo fue exitoso, confirmamos la transacción.
      await session.commitTransaction();

      // Refrescamos la caché para reflejar la eliminación.
      console.log(
        `Ruta '${rutaIdentifier}' (ID: ${routeMongoId}) eliminada. Refrescando la caché...`,
      );
      await initializeCaches();
      console.log("Caché refrescada exitosamente.");

      res.status(200).json({
        message: `Ruta '${rutaIdentifier}' y sus paradas asociadas fueron eliminadas correctamente.`,
      });
    } catch (error) {
      // Si algo falla durante la transacción, la revertimos.
      await session.abortTransaction();
      console.error("Error en la transacción al eliminar la ruta:", error);
      res.status(500).json({
        message: "Error interno del servidor al procesar la eliminación.",
      });
    } finally {
      // Es crucial cerrar la sesión al finalizar.
      session.endSession();
    }
  } catch (dbError) {
    console.error("Error de conexión con la base de datos:", dbError);
    res.status(500).json({
      message: "No se pudo establecer la conexión con la base de datos.",
    });
  }
};

/**
 * Obtener las paradas de una ruta específica
 */
export const obtenerParadasDeRuta = async (req, res) => {
  try {
    await connectMongoose();
    const db = mongoose.connection.useDb("xalapa_rutas");
    const ParadaModel = db.model("Parada", Parada.schema);

    const { id } = req.params;

    console.log("🔍 Buscando paradas para routeId:", id);

    // 🔧 CORRECCIÓN: Usar $elemMatch para buscar en el array
    const paradas = await ParadaModel.findOne({
      features: {
        $elemMatch: {
          "properties.routeId": id,
        },
      },
    });

    console.log("✅ Paradas encontradas:", paradas ? "SÍ" : "NO");

    if (!paradas) {
      return res.status(404).json({
        message: `No se encontraron paradas para el routeId '${id}'`,
      });
    }

    res.json(paradas);
  } catch (error) {
    console.error("Error al obtener paradas de la ruta:", error);
    res.status(500).json({
      error: "Error al obtener las paradas de la ruta",
      details: error.message,
    });
  }
};

/**
 * Actualizar una ruta por routeId
 */
export const actualizarRuta = async (req, res) => {
  try {
    await connectMongoose();
    const { rutaGeoJSON, paradasGeoJSON } = req.body;
    const { id } = req.params;

    // 🔍 DEBUG: Ver todo lo que llega
    console.log("=".repeat(60));
    console.log("🔍 ACTUALIZAR RUTA - ID recibido:", id);
    console.log("🔍 Tipo de ID:", typeof id);
    console.log(
      "🔍 rutaGeoJSON recibido:",
      JSON.stringify(rutaGeoJSON, null, 2),
    );
    console.log("=".repeat(60));

    // Validación inicial
    if (!rutaGeoJSON || !paradasGeoJSON) {
      return res.status(400).json({
        message: "Se requieren los datos GeoJSON de la ruta y las paradas.",
      });
    }

    if (
      rutaGeoJSON.type !== "FeatureCollection" ||
      paradasGeoJSON.type !== "FeatureCollection"
    ) {
      return res.status(400).json({
        message:
          "Los datos proporcionados no tienen el formato GeoJSON FeatureCollection válido.",
      });
    }

    const db = mongoose.connection.useDb("xalapa_rutas");
    const RutaModel = db.model("Ruta", Ruta.schema);
    const ParadaModel = db.model("Parada", Parada.schema);

    // 🔍 DEBUG: Ver qué hay en la base de datos
    const todasLasRutas = await RutaModel.find({}).limit(5).lean();
    console.log("📦 Primeras 5 rutas en DB:");
    todasLasRutas.forEach((ruta) => {
      if (ruta.features && ruta.features[0]) {
        console.log(
          `   - ID: ${ruta.features[0].properties?.id}, _id: ${ruta._id}, ruta: ${ruta.ruta}`,
        );
      }
    });

    // Buscar con $elemMatch
    console.log("🔍 Buscando con query:", {
      features: { $elemMatch: { "properties.id": id } },
    });

    const rutaExistente = await RutaModel.findOne({
      features: {
        $elemMatch: {
          "properties.id": id,
        },
      },
    });

    console.log("✅ Ruta encontrada:", rutaExistente ? "SÍ" : "NO");
    if (rutaExistente) {
      console.log("   - _id MongoDB:", rutaExistente._id);
      console.log("   - Campo 'ruta':", rutaExistente.ruta);
      console.log(
        "   - ID en features:",
        rutaExistente.features[0]?.properties?.id,
      );
    }

    if (!rutaExistente) {
      return res.status(404).json({
        message: `La ruta con ID '${id}' no fue encontrada.`,
      });
    }

    const rutaIdentifier = rutaGeoJSON.ruta || rutaExistente.ruta;
    const session = await db.startSession();

    try {
      session.startTransaction();

      const rutaActualizada = await RutaModel.findByIdAndUpdate(
        rutaExistente._id,
        {
          type: rutaGeoJSON.type,
          features: rutaGeoJSON.features,
          ruta: rutaIdentifier,
          image: rutaGeoJSON.image,
        },
        {
          new: true,
          runValidators: true,
          session,
        },
      );

      await ParadaModel.deleteOne({
        features: {
          $elemMatch: {
            "properties.routeId": id,
          },
        },
      }).session(session);

      if (paradasGeoJSON.features && paradasGeoJSON.features.length > 0) {
        paradasGeoJSON.features.forEach((feature) => {
          if (feature.properties) {
            feature.properties.routeId = id;
          }
        });
      }

      paradasGeoJSON.ruta = rutaIdentifier;
      const nuevasParadas = new ParadaModel(paradasGeoJSON);
      await nuevasParadas.save({ session });

      await session.commitTransaction();

      console.log(
        `✅ Ruta '${rutaIdentifier}' (ID: ${id}) actualizada exitosamente`,
      );
      await initializeCaches();

      res.status(200).json({
        message: "Ruta y paradas actualizadas exitosamente.",
        ruta: rutaActualizada,
      });
    } catch (error) {
      await session.abortTransaction();
      console.error("❌ Error en la transacción:", error);

      if (error.name === "ValidationError") {
        return res.status(400).json({
          message: "Los datos proporcionados son inválidos.",
          error: error.message,
        });
      }

      res.status(500).json({
        message: "Error interno del servidor al actualizar la ruta.",
        error: error.message,
      });
    } finally {
      session.endSession();
    }
  } catch (dbError) {
    console.error("❌ Error de conexión:", dbError);
    res.status(500).json({
      message: "No se pudo establecer la conexión con la base de datos.",
      error: dbError.message,
    });
  }
};
