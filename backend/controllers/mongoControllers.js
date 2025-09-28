import connectDB from "../config/mongo.js";
import { getStopCache, getRoutesCache } from "../cache.js"; // IMPORTA AMBAS CACHÉS
import { getDistanceInMeters } from "../utils/geolocation.js"; // UTILIDAD DE DISTANCIA
import UsuarioRutas from "../models/EsquemasMongo.js";
import mongoose from "mongoose";

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

    const db = await connectDB();
    const collection = db.collection("geocodificacion");

    const results = await collection
      .find(
        { nombre: { $regex: query, $options: "i" } },
        { projection: { nombre: 1, location: 1 } },
      )
      .limit(10)
      .toArray();

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

// --- Endpoint optimizado con caché ---
export const getAllRutas = (req, res) => {
  try {
    const rutas = getRoutesCache(); // Lee desde la memoria RAM
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

// --- Endpoint funcional y robusto para sugerir rutas ---
export const sugerirRuta = async (req, res) => {
  const { latOrigen, lngOrigen, latDestino, lngDestino } = req.query;

  if (!latOrigen || !lngOrigen || !latDestino || !lngDestino) {
    return res
      .status(400)
      .json({ message: "Faltan coordenadas de origen o destino." });
  }

  const origen = { lat: parseFloat(latOrigen), lng: parseFloat(lngOrigen) };
  const destino = { lat: parseFloat(latDestino), lng: parseFloat(lngDestino) };
  const radioBusqueda = 800; // Radio en metros aumentado para mejores resultados

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
      // Validación para asegurar que la parada tiene coordenadas válidas
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

    const db = await connectDB();
    const rutasInfo = await db
      .collection("rutas")
      .find({
        "features.properties.id": {
          $in: opcionesDeViaje.map((o) => o.routeId),
        },
      })
      .toArray();

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

export const crearUsuario = async (req, res) => {
  try {
    const { _id, email, nombreUsuario } = req.body;
    if (!_id || !email || !nombreUsuario) {
      return res
        .status(400)
        .json({ message: "El ID, email y nombre son requeridos." });
    }

    const db = await connectDB();
    const collection = db.collection("usuariosRutasFavoritas");

    const usuarioExistente = await collection.findOne({ _id: _id });

    if (usuarioExistente) {
      return res.status(200).json(usuarioExistente);
    } else {
      const nuevoUsuario = {
        _id,
        email,
        nombreUsuario,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const resultado = await collection.insertOne(nuevoUsuario);

      if (resultado.acknowledged) {
        return res.status(201).json(nuevoUsuario);
      } else {
        throw new Error("No se pudo insertar el usuario");
      }
    }
  } catch (error) {
    console.error("❌ Error completo en crearUsuario:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor al registrar el usuario." });
  }
};

export const getUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await UsuarioRutas.findById(id);

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    res.status(200).json(usuario);
  } catch (error) {
    console.error("Error en getUsuario:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const agregarRutaFavorita = async (req, res) => {
  console.log("=== INICIO agregarRutaFavorita ===");
  console.log("userId:", req.userId);
  console.log("rutaId:", req.body.rutaId);
  try {
    const { rutaId } = req.body;
    const userId = req.userId;
    const db = await connectDB();
    const collection = db.collection("usuariosRutasFavoritas");
    const usuarioActualizado = await collection.findOneAndUpdate(
      { _id: userId },
      { $addToSet: { rutasFavoritas: rutaId } },
      { returnDocument: "after" },
    );
    console.log("Resultado de findOneAndUpdate:", usuarioActualizado);

    if (!usuarioActualizado) {
      console.log("Usuario no encontrado, devolviendo 404");
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    console.log("Enviando respuesta exitosa");
    return res.status(200).json({
      success: true,
      user: usuarioActualizado,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

export const quitarRutaFavorita = async (req, res) => {
  try {
    const { userId, rutaId } = req.params;

    if (!rutaId) {
      return res
        .status(400)
        .json({ message: "El ID de la ruta es requerido." });
    }

    const usuarioActualizado = await UsuarioRutas.findByIdAndUpdate(
      userId,
      { $pull: { rutasFavoritas: rutaId } },
      { new: true },
    );

    if (!usuarioActualizado) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    res.status(200).json(usuarioActualizado);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al quitar la ruta favorita." });
  }
};

export const obtenerFavoritosUsuario = async (req, res) => {
  try {
    const userId = req.userId;
    const db = await connectDB();
    const collection = db.collection("usuariosRutasFavoritas");
    const usuario = await collection.findOne({ _id: userId });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({
      success: true,
      rutasFavoritas: usuario.rutasFavoritas || [],
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};
