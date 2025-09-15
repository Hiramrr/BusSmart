import connectDB from "./config/mongo.js";

// Aquí guardaremos nuestro arreglo plano de paradas.
let paradasCache = [];

/**
 * Inicializa la caché de paradas.
 * Lee todos los documentos de la colección 'paradas',
 * los aplana y los guarda en la variable paradasCache.
 */

export async function initStopCache() {
  try {
    console.log("Iniciando la carga de la caché de paradas...");
    const db = await connectDB();
    const paradasCollection = db.collection("paradas");

    // Traemos todos los documentos de la colección
    const todasLasRutasConParadas = await paradasCollection.find({}).toArray();

    // Usamos flatMap para transformar la estructura anidada en un arreglo plano
    paradasCache = todasLasRutasConParadas.flatMap((rutaDoc) => {
      // Por cada documento de ruta, iteramos sobre sus 'features' (paradas)
      return rutaDoc.features.map((paradaFeature) => {
        // Creamos un objeto simple por cada parada
        return {
          routeId: paradaFeature.properties.routeId,
          sequence: paradaFeature.properties.sequence,
          coordinates: paradaFeature.geometry.coordinates, // [lng, lat]
        };
      });
    });

    console.log(`Caché de paradas cargada exitosamente con ${paradasCache.length} paradas.`);
  } catch (error) {
    console.error("Error al inicializar la caché de paradas:", error);
    // Si la caché no carga, es un error crítico. Salimos del proceso.
    process.exit(1);
  }
}


//Devuelve la caché de paradas.
export function getStopCache() {
  return paradasCache;
}