// backend/cache.js

import connectDB from "./config/mongo.js";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import fs from "fs";

let paradasCache = [];
let rutasCache = []; // Caché para las rutas

/**
 * Inicializa TODAS las cachés de la aplicación.
 * 1. Carga las paradas y las aplana en un arreglo simple para 'sugerirRuta'.
 * 2. Carga las rutas y crea una lista simple para 'getAllRutas'.
 */
export const initializeCaches = async () => {
  try {
    const db = await connectDB();
    console.log("Iniciando la carga de cachés...");

    // --- 1. Cargar y procesar la caché de PARADAS ---
    const paradasCollection = db.collection("paradas");
    const todasLasRutasConParadas = await paradasCollection.find({}).toArray();

    // Usamos flatMap para asegurar una estructura de datos plana y correcta.
    paradasCache = todasLasRutasConParadas.flatMap((rutaDoc) => {
      return rutaDoc.features.map((paradaFeature) => {
        return {
          routeId: paradaFeature.properties.routeId,
          sequence: paradaFeature.properties.sequence,
          coordinates: paradaFeature.geometry.coordinates,
        };
      });
    });
    console.log(
      `✅ ${paradasCache.length} paradas cargadas y aplanadas en caché.`,
    );

    // --- 2. Cargar y procesar la caché de RUTAS ---
    const rutasCollection = db.collection("rutas");
    const projection = {
      projection: {
        "features.properties.id": 1,
        "features.properties.name": 1,
        "features.properties.desc": 1,
        "features.properties.mujer": 1,
        image: 1, // ⭐ Campo image del nivel raíz
        ruta: 1, // ⭐ Campo ruta del nivel raíz
      },
    };
    const todasLasRutas = await rutasCollection.find({}, projection).toArray();

    // Transformamos las rutas a un formato simple y útil para el listado.
    rutasCache = todasLasRutas.map((ruta) => {
      const props = ruta.features[0]?.properties || {};

      return {
        id: props.id,
        name: props.name,
        desc: props.desc,
        image: ruta.image || null, // ⭐ Usar el campo image del documento raíz
        mujer:
          typeof props.mujer !== "undefined" ? String(props.mujer) : undefined,
      };
    });

    console.log(`✅ ${rutasCache.length} rutas cargadas en caché.`);
  } catch (error) {
    console.error("❌ Error fatal al inicializar las cachés:", error);
    process.exit(1);
  }
};

// --- Getters para acceder a los datos cacheados ---

// Devuelve la caché de paradas.
export const getStopCache = () => paradasCache;

// Devuelve la caché de rutas.
export const getRoutesCache = () => rutasCache;
