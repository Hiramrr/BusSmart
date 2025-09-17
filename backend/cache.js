import connectDB from "./config/mongo.js";

let paradasCache = [];
let rutasCache = []; 

export const initializeCache = async () => {
  try {
    const db = await connectDB();
    console.log("Conectado a MongoDB para inicializar el caché...");

    //Cargar Paradas
    console.log("Cargando paradas en caché...");
    paradasCache = await db.collection("paradas").find({}).toArray();
    console.log(`✅ ${paradasCache.length} paradas cargadas en caché.`);

    //Cargar Rutas
    console.log("Cargando lista de rutas en caché...");
    const rutasProjection = {
      projection: {
        _id: 0,
        "features.properties.id": 1,
        "features.properties.name": 1,
        "features.properties.desc": 1,
      },
    };
    
    const todasLasRutas = await db.collection("rutas").find({}, rutasProjection).toArray();

    // Transformamos los datos para que sean más fáciles de usar en el frontend
    rutasCache = todasLasRutas.map(ruta => ({
        routeId: ruta.features[0].properties.id,
        nombreRuta: ruta.features[0].properties.name,
        descripcionRuta: ruta.features[0].properties.desc,
    }));

    console.log(`✅ ${rutasCache.length} rutas cargadas en caché.`);

  } catch (error) {
    console.error("❌ Error al inicializar el caché:", error);
    process.exit(1);
  }
};

// --- Getters para acceder a los datos cacheados ---
export const getStopCache = () => paradasCache;
export const getRoutesCache = () => rutasCache; 