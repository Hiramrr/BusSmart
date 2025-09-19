// backend/cache.js

import connectDB from "./config/mongo.js";

let paradasCache = [];
let rutasCache = []; // Agregamos la caché para las rutas

/**
 * Inicializa TODAS las cachés de la aplicación.
 * 1. Carga las paradas y las aplana en un arreglo simple para 'sugerirRuta'.
 * 2. Carga las rutas y crea una lista simple para 'getAllRutas'.
 */
export const initializeCaches = async () => {
  try {
    const db = await connectDB();
    console.log("Iniciando la carga de cachés...");

    // --- 1. Cargar y procesar la caché de PARADAS (la versión que funciona) ---
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
    console.log(`✅ ${paradasCache.length} paradas cargadas y aplanadas en caché.`);

    // --- 2. Cargar y procesar la caché de RUTAS (la nueva funcionalidad) ---
    const rutasCollection = db.collection("rutas");
    const projection = {
        projection: {
            "features.properties.id": 1,
            "features.properties.name": 1,
            "features.properties.desc": 1,
        }
    };
    const todasLasRutas = await rutasCollection.find({}, projection).toArray();
    
    // Transformamos las rutas a un formato simple y útil para el listado.
    rutasCache = todasLasRutas.map(ruta => ({
        id: ruta.features[0]?.properties.id,
        name: ruta.features[0]?.properties.name,
        desc: ruta.features[0]?.properties.desc,
    }));
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