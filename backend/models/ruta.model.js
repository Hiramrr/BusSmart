import mongoose from "mongoose";

// --- Esquema para la Geometría (sub-documento) ---
const geometrySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['LineString'], // Solo se permiten LineStrings para las rutas
    required: true,
  },
  coordinates: {
    type: [[Number]], // Un array de arrays de arrays de números [long, lat]
    required: true,
  },
}, { _id: false });

// --- Esquema para las Propiedades del Feature (sub-documento) ---
const routePropertiesSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  desc: String,
  notes: String,
  peak_am: Number,
  midday: Number,
  peak_pm: Number,
  night: Number,
}, { _id: false });

// --- Esquema para el Feature (sub-documento) ---
const featureSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Feature'],
    required: true,
  },
  properties: routePropertiesSchema,
  geometry: geometrySchema,
}, { _id: false });

// --- Esquema Principal de la Ruta ---
const rutaSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['FeatureCollection'],
    required: true,
  },
  features: [featureSchema], // La ruta debe tener al menos un feature
  ruta: { // Este es el identificador corto, como "104" o "SA"
    type: String,
    required: [true, 'El identificador de la ruta es obligatorio.'],
    unique: true,
    trim: true,
  },
}, {
  timestamps: true, // Añade createdAt y updatedAt automáticamente
});

const Ruta = mongoose.model("Ruta", rutaSchema, "rutas");

export default Ruta;