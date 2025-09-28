import { esquemaUsuarioRutas } from "../models/EsquemasMongo.js";
import mongoose from "mongoose";

// Esta definición se moverá a su propio archivo de modelo más adelante
const UsuarioRutas = mongoose.model("UsuarioRutas", esquemaUsuarioRutas);

export const crearUsuario = async (req, res) => {
  try {
    const { _id, email, nombreUsuario } = req.body;

    if (!_id || !email || !nombreUsuario) {
      return res
        .status(400)
        .json({ message: "El ID, email y nombre son requeridos." });
    }

    const usuarioExistente = await UsuarioRutas.findById(_id);

    if (usuarioExistente) {
      console.log(
        `Usuario ya existente encontrado: ${usuarioExistente.nombreUsuario}`
      );
      return res.status(200).json(usuarioExistente);
    } else {
      console.log(`Creando nuevo registro en MongoDB para: ${nombreUsuario}`);
      const nuevoUsuario = new UsuarioRutas({
        _id,
        email,
        nombreUsuario,
      });

      const usuarioGuardado = await nuevoUsuario.save();
      return res.status(201).json(usuarioGuardado);
    }
  } catch (error) {
    console.error("Error en crearUsuario:", error);
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
  try {
    const { userId } = req.params;
    const { ruta } = req.body;

    if (!ruta) {
      return res
        .status(400)
        .json({ message: "El nombre de la ruta es requerido." });
    }

    const usuarioActualizado = await UsuarioRutas.findByIdAndUpdate(
      userId,
      { $addToSet: { rutasFavoritas: ruta } },
      { new: true }
    );

    if (!usuarioActualizado) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    res.status(200).json(usuarioActualizado);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al agregar la ruta favorita." });
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
      { new: true }
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