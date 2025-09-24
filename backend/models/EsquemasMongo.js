import mongoose from "mongoose";

const Schema = mongoose.Schema;
export const esquemaUsuarioRutas = new Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    nombreUsuario: {
      type: String,
      required: true,
      trim: true,
    },
    rutasFavoritas: {
      type: [String],
      default: [],
    },
  },
  {
    collection: "usuariosRutasFavoritas",
  },
);
