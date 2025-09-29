import connectDB from "../config/mongo.js";
import UsuarioRutas from "../models/EsquemasMongo.js";

export const crearUsuario = async (req, res) => {
  try {
    const { _id, email, nombreUsuario } = req.body;
    if (!_id || !nombreUsuario) {
      return res.status(400).json({ message: "El ID nombre son requeridos." });
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
  console.log("=== INICIO quitarRutaFavorita ===");
  console.log("userId:", req.userId);
  console.log("rutaId desde params:", req.params.rutaId);

  try {
    const rutaId = req.params.rutaId; // Viene de la URL
    const userId = req.userId; // Viene del middleware

    if (!rutaId) {
      return res
        .status(400)
        .json({ message: "El ID de la ruta es requerido." });
    }

    const db = await connectDB(); // Mismo patrón que agregarRutaFavorita
    const collection = db.collection("usuariosRutasFavoritas");

    const usuarioActualizado = await collection.findOneAndUpdate(
      { _id: userId },
      { $pull: { rutasFavoritas: rutaId } },
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