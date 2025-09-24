import mongoose from "mongoose";

// --- Esquema para la Geometría de Puntos (sub-documento) ---
const pointGeometrySchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Point'], // Solo se permiten Puntos para las paradas
        required: true,
    },
    coordinates: {
        type: [Number], // Un array de [long, lat]
        required: true,
    },
}, { _id: false });

// --- Esquema para las Propiedades de las Paradas (sub-documento) ---
const stopPropertiesSchema = new mongoose.Schema({
    id: { type: String, required: true },
    routeId: { type: String, required: true },
    sequence: { type: Number, required: true },
    travelTime: Number,
    dwellTime: Number,
    arrivalTim: Number,
    departureT: Number,
    passengerA: Number,
    passengerB: Number,
}, { _id: false });

// --- Esquema para el Feature de la Parada (sub-documento) ---
const stopFeatureSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Feature'],
        required: true,
    },
    properties: stopPropertiesSchema,
    geometry: pointGeometrySchema,
}, { _id: false });

// --- Esquema Principal de las Paradas ---
const paradaSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['FeatureCollection'],
        required: true,
    },
    features: [stopFeatureSchema],
    ruta: { // Identificador para vincular con un documento de la colección 'rutas'
        type: String,
        required: [true, 'El identificador de la ruta a la que pertenecen las paradas es obligatorio.'],
        trim: true,
    },
}, {
    timestamps: true, // Añade createdAt y updatedAt
});

// Crear un índice en 'ruta' para optimizar las búsquedas que filtran por este campo
paradaSchema.index({ ruta: 1 });

const Parada = mongoose.model("Parada", paradaSchema, "paradas");

export default Parada;