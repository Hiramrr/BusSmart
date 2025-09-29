import mongoose from "mongoose";
import connectDB from "../config/mongo.js";
import { getStopCache, getRoutesCache, initializeCaches } from "../cache.js";
import { getDistanceInMeters } from "../utils/geolocation.js";
import { connectMongoose } from '../config/mongo.js';
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
  try {
    // --- CONEXIÓN ---
    await connectMongoose(); 

    // --- LÓGICA EXISTENTE (CON AJUSTES) ---
    const { rutaData, paradasData } = req.body;

    // 1. Validación de entrada (sin cambios)
    if (!rutaData || !paradasData) {
      return res.status(400).json({
        message: "Se requiere tanto la información de la ruta (rutaData) como de las paradas (paradasData).",
      });
    }

    // (2/3) CORRECCIÓN: Seleccionamos la base de datos correcta.
    const db = mongoose.connection.useDb('xalapa_rutas');

    // (3/3) CORRECCIÓN: Ahora que los modelos están registrados por los imports,
    // los "re-compilamos" para que apunten a la base de datos 'xalapa_rutas'.
    const RutaModel = db.model('Ruta', Ruta.schema); 
    const ParadaModel = db.model('Parada', Parada.schema);

    const session = await db.startSession(); 
    session.startTransaction();

    try {
      // Usamos los modelos que apuntan a la base de datos correcta
      const nuevaRuta = new RutaModel(rutaData);
      const rutaGuardada = await nuevaRuta.save({ session });

      paradasData.ruta = rutaGuardada.ruta;
      const nuevasParadas = new ParadaModel(paradasData);
      await nuevasParadas.save({ session });

      await session.commitTransaction();

      console.log("Ruta creada. Refrescando la caché...");
      await initializeCaches();
      console.log("Caché refrescada exitosamente.");

      res.status(201).json({
        message: "Ruta y paradas creadas exitosamente en 'xalapa_rutas'.",
        ruta: rutaGuardada,
      });
    } catch (error) {
      await session.abortTransaction();
      console.error("Error en la transacción al crear la ruta:", error);

      if (error.code === 11000) { 
        return res.status(409).json({
          message: `El identificador de ruta '${rutaData.ruta}' ya existe.`,
        });
      }

      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: "Datos inválidos.", error: error.message });
      }

      res.status(500).json({ message: "Error interno del servidor al crear la ruta." });
    } finally {
      session.endSession();
    }
  } catch (dbError) {
    console.error("Error al intentar conectar con Mongoose o al compilar modelos:", dbError);
    res.status(500).json({ message: "No se pudo establecer la conexión con la base de datos." });
  }
};


export const eliminarRuta = async (req, res) => {
  try {
    // 1. Conectamos a Mongoose
    await connectMongoose();

    // 2. Obtenemos el ID de la ruta desde los parámetros de la URL (ej: "PRUEBA-01")
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Se requiere el identificador de la ruta en la URL." });
    }

    // 3. Seleccionamos la base de datos 'xalapa_rutas'
    const db = mongoose.connection.useDb('xalapa_rutas');
    const RutaModel = db.model('Ruta', Ruta.schema);
    const ParadaModel = db.model('Parada', Parada.schema);

    // 4. Iniciamos una transacción para una eliminación segura
    const session = await db.startSession();
    session.startTransaction();

    try {
      // Intentamos eliminar el documento de la ruta
      const resultadoRuta = await RutaModel.deleteOne({ ruta: id }).session(session);

      // Si no se borró ningún documento, significa que la ruta no existía
      if (resultadoRuta.deletedCount === 0) {
        await session.abortTransaction(); // Cancelamos la transacción
        session.endSession();
        return res.status(404).json({ message: `La ruta con el identificador '${id}' no fue encontrada.` });
      }

      // Si la ruta existía y se borró, procedemos a borrar sus paradas
      await ParadaModel.deleteOne({ ruta: id }).session(session);
      
      // Si todo salió bien, confirmamos los cambios en la base de datos
      await session.commitTransaction();

      // Refrescamos la caché para eliminar la ruta de la memoria
      console.log(`Ruta '${id}' eliminada. Refrescando la caché...`);
      await initializeCaches();
      console.log("Caché refrescada exitosamente.");

      // Enviamos una respuesta de éxito
      res.status(200).json({ message: `Ruta '${id}' y sus paradas asociadas fueron eliminadas correctamente.` });

    } catch (error) {
      // Si algo falla, revertimos todos los cambios
      await session.abortTransaction();
      console.error("Error en la transacción al eliminar la ruta:", error);
      res.status(500).json({ message: "Error interno del servidor al eliminar la ruta." });
    } finally {
      // Siempre cerramos la sesión
      session.endSession();
    }
  } catch (dbError) {
    console.error("Error al conectar con Mongoose:", dbError);
    res.status(500).json({ message: "No se pudo establecer la conexión con la base de datos." });
  }
};